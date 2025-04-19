require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION || 'unknown';
const NODE_ENV = process.env.NODE_ENV || 'production';

app.use(helmet());
app.use(compression());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
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
  res.status(200).send('OK');
});

app.get('/version', (req, res) => {
  res.status(200).send(VERSION);
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'views', '404.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;