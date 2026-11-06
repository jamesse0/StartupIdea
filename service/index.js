import express from 'express';
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

// Any other path goes to the React app so React Router can handle routes like /listings
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Usernames and emails are matched case-insensitively so "Cosmo" and "cosmo" can't both register
function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field].toLowerCase() === value.toLowerCase()) || null;
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
