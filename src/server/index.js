const express = require('express');
const path = require('path');
const serverRouter = require('./src/routes.js');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
// app.use("/",serverRouter);

// The "catchall" handler: for any request that doesn't
// match one above, send back the basic table of contents file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Weather RPI express server listening on ${port}`);