import express from 'express';

const app = express();

// The deploy script passes the port on the command line; 4000 is the default for local development
const port = process.argv.length > 2 ? process.argv[2] : 4000;

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

// Any other path goes to the React app so React Router can handle routes like /listings
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`CougarGrub service listening on port ${port}`);
});
