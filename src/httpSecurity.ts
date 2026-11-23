import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";

export const DEFAULT_HTTP_HOST = "127.0.0.1";

function argValue(argv: string[], flag: string): string | undefined {
    const index = argv.indexOf(flag);
    if (index !== -1 && index + 1 < argv.length) {
        return argv[index + 1];
    }
    return undefined;
}

export function resolveHttpHost(
    argv: string[] = process.argv,
    env: NodeJS.ProcessEnv = process.env
): string {
    const fromArg = argValue(argv, "--host");
    const fromEnv = env.MCP_HTTP_HOST;
    return fromArg || fromEnv || DEFAULT_HTTP_HOST;
}

export function resolveAuthToken(
    argv: string[] = process.argv,
    env: NodeJS.ProcessEnv = process.env
): string | undefined {
    const fromEnv = env.MCP_AUTH_TOKEN;
    if (fromEnv && fromEnv.length > 0) {
        return fromEnv;
    }
    return undefined;
}

export function requireHttpAuthToken(
    argv: string[] = process.argv,
    env: NodeJS.ProcessEnv = process.env
): string {
    const token = resolveAuthToken(argv, env);
    if (!token) {
        throw new Error("HTTP mode requires the MCP_AUTH_TOKEN environment variable");
    }
    return token;
}

export function timingSafeEqualString(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) {
        return false;
    }
    return timingSafeEqual(aBuf, bBuf);
}

export function createBearerAuthMiddleware(expectedToken: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const header = req.headers.authorization;
        const match = /^Bearer\s+(\S+)$/i.exec(header ?? "");
        const provided = match?.[1];
        if (!provided || !timingSafeEqualString(provided, expectedToken)) {
            res.setHeader("WWW-Authenticate", "Bearer");
            res.status(401).json({
                jsonrpc: "2.0",
                error: { code: -32001, message: "Unauthorized" },
                id: null
            });
            return;
        }
        next();
    };
}
