require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://use.typekit.net", "https://umami.loiskauffungen.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://use.typekit.net", "https://p.typekit.net"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            fontSrc: ["'self'", "https://use.typekit.net", "data:"],
            connectSrc: ["'self'", "https://umami.loiskauffungen.com"],
            mediaSrc: ["'self'", "blob:"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

// Logging middleware
app.use(morgan("combined"));

// Compression middleware
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

app.get("/health", (req, res) => {
    res.send("OK");
});

app.get("/version", (req, res) => {
    const packageJson = require("./package.json");
    res.json({ version: packageJson.version });
});

app.use((req, res) => {
    res.redirect("/");
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;