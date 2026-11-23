import { Request, Response } from "express";
import {
    DEFAULT_HTTP_HOST,
    createBearerAuthMiddleware,
    requireHttpAuthToken,
    resolveAuthToken,
    resolveHttpHost,
    timingSafeEqualString
} from "./httpSecurity.js";

function mockRes() {
    const res: Partial<Response> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    return res as Response;
}

describe("httpSecurity", () => {
    describe("resolveHttpHost", () => {
        test("defaults to loopback", () => {
            expect(resolveHttpHost(["node", "app.js"], {})).toBe(DEFAULT_HTTP_HOST);
            expect(DEFAULT_HTTP_HOST).toBe("127.0.0.1");
        });

        test("uses --host over MCP_HTTP_HOST", () => {
            expect(resolveHttpHost(
                ["node", "app.js", "--host", "0.0.0.0"],
                { MCP_HTTP_HOST: "10.0.0.1" }
            )).toBe("0.0.0.0");
        });

        test("uses MCP_HTTP_HOST when --host is absent", () => {
            expect(resolveHttpHost(["node", "app.js"], { MCP_HTTP_HOST: "0.0.0.0" })).toBe("0.0.0.0");
        });
    });

    describe("resolveAuthToken / requireHttpAuthToken", () => {
        test("reads MCP_AUTH_TOKEN", () => {
            expect(resolveAuthToken(["node"], { MCP_AUTH_TOKEN: "secret" })).toBe("secret");
        });

        test("treats empty token as missing", () => {
            expect(resolveAuthToken(["node"], { MCP_AUTH_TOKEN: "" })).toBeUndefined();
        });

        test("requireHttpAuthToken throws when missing", () => {
            expect(() => requireHttpAuthToken(["node"], {})).toThrow(/MCP_AUTH_TOKEN/);
        });
    });

    describe("timingSafeEqualString", () => {
        test("accepts equal strings", () => {
            expect(timingSafeEqualString("abc", "abc")).toBe(true);
        });

        test("rejects different strings and lengths", () => {
            expect(timingSafeEqualString("abc", "abd")).toBe(false);
            expect(timingSafeEqualString("abc", "ab")).toBe(false);
        });
    });

    describe("createBearerAuthMiddleware", () => {
        const middleware = createBearerAuthMiddleware("secret-token");

        test("rejects missing Authorization header", () => {
            const req = { headers: {} } as Request;
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.setHeader).toHaveBeenCalledWith("WWW-Authenticate", "Bearer");
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                jsonrpc: "2.0",
                error: { code: -32001, message: "Unauthorized" },
                id: null
            });
        });

        test("rejects a wrong bearer token", () => {
            const req = { headers: { authorization: "Bearer other" } } as Request;
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
        });

        test("accepts the expected bearer token", () => {
            const req = { headers: { authorization: "Bearer secret-token" } } as Request;
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
