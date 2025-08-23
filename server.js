const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.get('/cv', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'cv.html'));
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.get('/version', (req, res) => {
  res.json({ version: '1.0.0' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;