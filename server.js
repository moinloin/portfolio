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
            // Inline scripts are not allowed; the one inline <script> (the import map)
            // is allow-listed by its SHA-256 hash. Regenerate the hash if the import map changes.
            scriptSrc: ["'self'", "'sha256-2KTjkpggOfxHs7Wt3RNXlTCIQghmhK/UwqnEYxDFWwA='", "https://unpkg.com", "https://umami.loiskauffungen.com"],
            // 'unsafe-inline' is required here because the markup uses inline style="" attributes,
            // which cannot be allow-listed by hash or nonce.
            styleSrc: ["'self'", "'unsafe-inline'", "https://use.typekit.net", "https://p.typekit.net"],
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
    const version = process.env.VERSION || require("./package.json").version;
    res.json({ version });
});

// Unknown paths: 404 for asset-like requests (have a file extension),
// redirect navigational requests to the home page.
app.use((req, res) => {
    if (path.extname(req.path)) {
        res.status(404).send("Not Found");
    } else {
        res.redirect("/");
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;