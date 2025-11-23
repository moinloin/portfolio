const request = require("supertest");
const app = require("../server");

describe("Static Assets", () => {
    test("GET /css/style.css should return CSS file", async () => {
        const response = await request(app).get("/css/style.css");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/css/);
    });

    test("GET /css/cv-styles.css should return CSS file", async () => {
        const response = await request(app).get("/css/cv-styles.css");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/css/);
    });

    test("GET /js/index.js should return JavaScript file", async () => {
        const response = await request(app).get("/js/index.js");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/javascript/);
    });

    test("GET /js/cv.js should return JavaScript file", async () => {
        const response = await request(app).get("/js/cv.js");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/javascript/);
    });
});