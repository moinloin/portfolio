const request = require("supertest");
const app = require("../server");

describe("Server Endpoints", () => {
    test("GET / should return 200 status code", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/html/);
    });

    test("GET /cv should return 200 status code", async () => {
        const response = await request(app).get("/cv");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/html/);
    });

    test("GET /health should return 200 status code and OK text", async () => {
        const response = await request(app).get("/health");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("OK");
    });

    test("GET /version should return 200 status code", async () => {
        const response = await request(app).get("/version");
        expect(response.statusCode).toBe(200);
    });

    test("GET /nonexistent-route should return 404 status code", async () => {
        const response = await request(app).get("/nonexistent-route");
        expect(response.statusCode).toBe(404);
        expect(response.headers["content-type"]).toMatch(/html/);
    });
});