const globals = require("globals");

module.exports = [
    {
        ignores: ["node_modules/**", "coverage/**", "**/*.min.js", "public/libs/**"]
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.es2021,
                ...globals.jest
            }
        },
        rules: {
            "indent": ["error", 4],
            "linebreak-style": ["error", "unix"],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "no-unused-vars": ["warn"],
            "no-console": "off"
        }
    },
    {
        files: ["public/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                THREE: "readonly"
            }
        }
    },
    {
        files: ["server.js", "tests/**/*.js"],
        languageOptions: {
            sourceType: "script"
        }
    }
];
