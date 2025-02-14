const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Statische Dateien ausliefern
app.use(express.static(path.join(__dirname, 'public')));

// Route für /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route für /cv
app.get('/cv', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cv.html'));
});

// 404 für alle anderen Routen
app.use((req, res) => {
    res.status(404).send('Seite nicht gefunden');
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
