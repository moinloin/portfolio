const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION || 'unknown';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'views', 'robots.txt'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.get('/cv', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'cv.html'));
});

app.get('/health', (req, res) => {
  //res.status(200).send('OK');
});

app.get('/version', (req, res) => {
  res.status(200).send(VERSION);
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'views', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
