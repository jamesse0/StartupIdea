import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';

const app = express();

// The deploy script passes the port on the command line; 4000 is the default for local development
const port = process.argv.length > 2 ? process.argv[2] : 4000;

const authCookieName = 'token';

// In-memory storage until the DB deliverable moves this to MongoDB
const users = [];

// Signups waiting on their email code, keyed by a pendingId the frontend holds onto
const pendingSignups = new Map();
const CODE_LIFETIME = 10 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

const MINUTE = 60 * 1000;
const GONE_THRESHOLD = 3;
const DEFAULT_IMAGE = 'https://commons.wikimedia.org/wiki/Special:FilePath/Good_Food_Display_-_NCI_Visuals_Online.jpg?width=400';

// Free food listings, newest first. Starts with a few examples so the app isn't empty after a restart
const events = createSeedEvents();

// The Google Geocoding key lives in mapsConfig.json, which is gitignored and never sent to the browser
const geocodeKey = loadGeocodeKey();
// Remembers recent lookups so the same building isn't sent to Google over and over
const geocodeCache = new Map();
const GEOCODE_CACHE_LIMIT = 500;
// Short names like "JSB" are looked up on BYU's campus
const CAMPUS_SUFFIX = 'Brigham Young University, Provo, UT';

// Parse JSON request bodies; the limit is raised because event photos arrive as base64 data URLs
app.use(express.json({ limit: '2mb' }));

// Read the auth token cookie on incoming requests
app.use(cookieParser());

// Serve the built React frontend once it's deployed into the public directory
app.use(express.static('public'));

// All backend endpoints live under /api so Vite can proxy them during development
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Quick check that the service is up
apiRouter.get('/status', (_req, res) => {
  res.send({ status: 'ok' });
});

// Start a signup: validate the details and hold them until the email code is verified
apiRouter.post('/auth/create', async (req, res) => {
  const body = req.body ?? {};
  const userName = body.userName?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!userName || !email || !password) {
    return res.status(400).send({ msg: 'Username, email, and password are required.' });
  }
  if (!email.endsWith('@byu.edu')) {
    return res.status(400).send({ msg: 'Must be a @byu.edu email.' });
  }
  const conflict = findConflict(userName, email);
  if (conflict) {
    return res.status(409).send(conflict);
  }

  clearExpiredSignups();
  const pendingId = uuid();
  const code = String(randomInt(100000, 1000000));
  pendingSignups.set(pendingId, {
    userName,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    code,
    expiresAt: Date.now() + CODE_LIFETIME,
    attempts: 0,
  });

  // Demo mode: email isn't hooked up, so the code comes back in the response for the frontend to show
  res.send({ pendingId, demoCode: code });
});

// Finish a signup: check the email code, then create the account and log the user in
apiRouter.post('/auth/verify', (req, res) => {
  const { pendingId, code } = req.body ?? {};
  const pending = pendingSignups.get(pendingId);

  if (!pending || pending.expiresAt < Date.now()) {
    pendingSignups.delete(pendingId);
    return res.status(410).send({ msg: 'That code expired. Start over to get a new one.' });
  }
  if (String(code) !== pending.code) {
    pending.attempts += 1;
    if (pending.attempts >= MAX_CODE_ATTEMPTS) {
      pendingSignups.delete(pendingId);
      return res.status(410).send({ msg: 'Too many wrong codes. Start over to get a new one.' });
    }
    return res.status(400).send({ msg: "That code doesn't match. Try again." });
  }

  // Someone else may have finished signing up with the same name or email in the meantime
  pendingSignups.delete(pendingId);
  const conflict = findConflict(pending.userName, pending.email);
  if (conflict) {
    return res.status(409).send(conflict);
  }

  const user = createUser(pending.userName, pending.email, pending.passwordHash);
  setAuthCookie(res, user.token);
  res.send({ userName: user.userName });
});

// Log in with a username and password; a fresh token replaces any old one
apiRouter.put('/auth/login', async (req, res) => {
  const { userName, password } = req.body ?? {};
  const user = findUser('userName', userName?.trim());
  if (user && password && (await bcrypt.compare(password, user.password))) {
    user.token = uuid();
    setAuthCookie(res, user.token);
    return res.send({ userName: user.userName });
  }
  res.status(401).send({ msg: 'Incorrect username or password.' });
});

// Log out by forgetting the token on the server and clearing the cookie
apiRouter.delete('/auth/logout', (req, res) => {
  const user = findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware for restricted endpoints: only continue if the request has a valid auth token
function verifyAuth(req, res, next) {
  const user = findUser('token', req.cookies[authCookieName]);
  if (!user) {
    return res.status(401).send({ msg: 'Please log in first.' });
  }
  req.user = user;
  next();
}

// Restricted: tells the frontend who is logged in, or 401 if nobody is
apiRouter.get('/user/me', verifyAuth, (req, res) => {
  res.send({ userName: req.user.userName });
});

// Restricted: every current listing, newest first
apiRouter.get('/events', verifyAuth, (_req, res) => {
  res.send(events);
});

// Restricted: post a new listing. The poster is always the logged-in user, never something the client sends
apiRouter.post('/events', verifyAuth, (req, res) => {
  const body = req.body ?? {};
  const title = body.title?.trim();
  const foodType = body.foodType?.trim();
  const location = body.location?.trim();

  if (!title || !foodType || !location) {
    return res.status(400).send({ msg: 'Title, food type, and location are required.' });
  }

  const event = {
    id: uuid(),
    title,
    foodType,
    location,
    description: body.description?.trim() || '',
    image: isImage(body.image) ? body.image : DEFAULT_IMAGE,
    poster: req.user.userName,
    postedAt: Date.now(),
    goneReports: [],
  };
  events.unshift(event);
  res.status(201).send(event);
});

// Restricted: only the person who posted a listing can take it down
apiRouter.delete('/events/:id', verifyAuth, (req, res) => {
  const index = events.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).send({ msg: 'That listing is already gone.' });
  }
  if (events[index].poster !== req.user.userName) {
    return res.status(403).send({ msg: 'You can only take down your own posts.' });
  }
  events.splice(index, 1);
  res.status(204).end();
});

// Restricted: anyone except the poster can report the food as gone, once each.
// Enough reports take the listing down
apiRouter.post('/events/:id/gone', verifyAuth, (req, res) => {
  const index = events.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).send({ msg: 'That listing is already gone.' });
  }
  const event = events[index];
  const userName = req.user.userName;
  if (event.poster === userName) {
    return res.status(403).send({ msg: "You can't report your own post. Take it down instead." });
  }
  if (event.goneReports.includes(userName)) {
    return res.status(409).send({ msg: "You've already reported this one." });
  }

  event.goneReports.push(userName);
  const removed = event.goneReports.length >= GONE_THRESHOLD;
  if (removed) {
    events.splice(index, 1);
  }
  res.send({ event, removed });
});

// Restricted: turns a typed location into Google's matched address and coordinates.
// The browser only talks to this endpoint, so the Google key never leaves the server
apiRouter.get('/geocode', verifyAuth, async (req, res) => {
  const address = String(req.query.address ?? '').trim();
  if (!address || address.length > 200) {
    return res.status(400).send({ msg: 'Enter a location to look up.' });
  }
  if (!geocodeKey) {
    return res.status(503).send({ msg: "Location lookup isn't set up on the server." });
  }

  const cacheKey = address.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return res.send(geocodeCache.get(cacheKey));
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', `${address}, ${CAMPUS_SUFFIX}`);
    url.searchParams.set('region', 'us');
    url.searchParams.set('key', geocodeKey);
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return res.status(404).send({ msg: "Couldn't find that spot. Try a building name or address." });
    }
    if (data.status !== 'OK') {
      // Log Google's reason (bad key, IP not allowed, quota hit) for us, but keep it out of the response
      console.error('Geocoding failed:', data.status, data.error_message);
      return res.status(502).send({ msg: 'Location lookup is unavailable right now.' });
    }

    // exact is false when Google couldn't place it and fell back to somewhere general, like the middle of campus
    const match = data.results[0];
    const result = {
      address: match.formatted_address,
      lat: match.geometry.location.lat,
      lng: match.geometry.location.lng,
      exact: !match.partial_match,
    };
    if (geocodeCache.size >= GEOCODE_CACHE_LIMIT) {
      geocodeCache.delete(geocodeCache.keys().next().value);
    }
    geocodeCache.set(cacheKey, result);
    res.send(result);
  } catch (err) {
    console.error('Geocoding failed:', err.message);
    res.status(502).send({ msg: 'Location lookup is unavailable right now.' });
  }
});

// Any other path goes to the React app so React Router can handle routes like /listings
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Turn errors (like a photo that's too big) into a short JSON message instead of an HTML stack trace
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  let msg = 'Something went wrong on the server.';
  if (status === 413) {
    msg = 'That photo is too large. Try a smaller one.';
  } else if (status < 500) {
    msg = "That request couldn't be read.";
  }
  res.status(status).send({ msg });
});

// Usernames and emails are matched case-insensitively so "Cosmo" and "cosmo" can't both register
function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field]?.toLowerCase() === value.toLowerCase()) || null;
}

// Returns which field is taken and why, so the frontend can show the error under the right input
function findConflict(userName, email) {
  if (findUser('userName', userName)) {
    return { field: 'userName', msg: 'That username is already taken. Pick another, or log in instead.' };
  }
  if (findUser('email', email)) {
    return { field: 'email', msg: 'An account with that email already exists.' };
  }
  return null;
}

// The password is already hashed with bcrypt when the signup starts
function createUser(userName, email, passwordHash) {
  const user = { userName, email, password: passwordHash, token: uuid() };
  users.push(user);
  return user;
}

// Accept uploaded photos (data URLs) and web images; anything else falls back to the default photo
function isImage(value) {
  return typeof value === 'string' && (value.startsWith('data:image/') || value.startsWith('https://'));
}

function createSeedEvents() {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      title: 'Free Pizza - Wilkinson Center',
      foodType: 'Pizza',
      location: 'Wilkinson Student Center, Room 2260',
      description: 'Leftovers from a club meeting, about 6 boxes.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pizza_pie.jpg?width=400',
      poster: 'cosmo_fan',
      postedAt: now - 12 * MINUTE,
      goneReports: [],
    },
    {
      id: 'seed-2',
      title: 'Leftover Donuts - Testing Center',
      foodType: 'Donuts',
      location: 'Testing Center Lobby',
      description: 'Two dozen assorted donuts on the table by the doors.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Free_Colorful_Donuts_(12097493966).jpg?width=400',
      poster: 'mia_r',
      postedAt: now - 35 * MINUTE,
      goneReports: [],
    },
    {
      id: 'seed-3',
      title: 'Fresh Cookies - Harold B. Lee Library',
      foodType: 'Cookies',
      location: 'HBLL 1st Floor Study Area',
      description: 'Chocolate chip cookies from a study group, help yourself.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chocolate_Chip_Cookies_-_kimberlykv.jpg?width=400',
      poster: 'tbennett',
      postedAt: now - 50 * MINUTE,
      goneReports: [],
    },
  ];
}

// Missing config just turns location lookup off instead of crashing the server
function loadGeocodeKey() {
  try {
    const config = JSON.parse(readFileSync(new URL('./mapsConfig.json', import.meta.url), 'utf8'));
    return config.geocodeKey || null;
  } catch {
    console.warn('mapsConfig.json not found or unreadable; location lookup is disabled.');
    return null;
  }
}

function clearExpiredSignups() {
  const now = Date.now();
  for (const [id, pending] of pendingSignups) {
    if (pending.expiresAt < now) {
      pendingSignups.delete(id);
    }
  }
}

// httpOnly keeps the token away from frontend JavaScript; secure and sameSite limit where it gets sent
function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`CougarGrub service listening on port ${port}`);
});
