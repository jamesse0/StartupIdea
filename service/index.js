import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const app = express();

// The deploy script passes the port on the command line; 4000 is the default for local development
const port = process.argv.length > 2 ? process.argv[2] : 4000;

const authCookieName = 'token';

// In-memory storage until the DB deliverable moves this to MongoDB
const users = [];

// Parse JSON request bodies
app.use(express.json());

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

// Create a new account and log the user in
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
  if (findUser('userName', userName)) {
    return res.status(409).send({ msg: 'That username is already taken. Pick another, or log in instead.' });
  }
  if (findUser('email', email)) {
    return res.status(409).send({ msg: 'An account with that email already exists.' });
  }

  const user = await createUser(userName, email, password);
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

// Any other path goes to the React app so React Router can handle routes like /listings
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Usernames and emails are matched case-insensitively so "Cosmo" and "cosmo" can't both register
function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field]?.toLowerCase() === value.toLowerCase()) || null;
}

async function createUser(userName, email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { userName, email, password: passwordHash, token: uuid() };
  users.push(user);
  return user;
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
