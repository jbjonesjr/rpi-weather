
import express from 'express';
import serverRouter from './src/routes.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
// app.use("/",serverRouter);

// The "catchall" handler: for any request that doesn't
// match one above, send back the basic table of contents file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Weather RPI express server listening on ${port}`);