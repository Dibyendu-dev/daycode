import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
});

import { Hono } from 'hono';
import * as Sentry from "@sentry/hono/bun";
import { sentry } from "@sentry/hono/bun";
import { HTTPException } from "hono/http-exception";
import sessions from "./routes/session";
import chat from "./routes/chat";
import auth from "./routes/auth";
import { requireAuth, type AuthenticatedEnv } from "./middleware/require-auth";
import billing from "./routes/billing";
const app = new Hono<AuthenticatedEnv>();

app.use(
  sentry(app, {
    dsn: "https://0aadb5994710bd17912d776140594cd1@o4511477624406016.ingest.us.sentry.io/4511477630304256",
    tracesSampleRate: 1.0,
    enableLogs: true,
    sendDefaultPii: true,
  }),
);

app.get("/debug-sentry", () => {
  // Send a log before throwing the error
  Sentry.logger.info('User triggered test error', {
    action: 'test_error_endpoint',
  });
  // Send a test metric before throwing the error
  Sentry.metrics.count('test_counter', 1);
  throw new Error("My first Sentry error!");
});

app.onError((error,c)=> {
    if (error instanceof HTTPException) {
        Sentry.logger.warn("Handled http error", {
          status: error.status,
          message: error.message || "request failed",
          path: c.req.path,
          method: c.req.method
        })
        return c.json({
            error: error.message || "Request failed",
        },error.status)
    }

    console.error("unhandled server error",error);
    return c.json({ error: "Internal server error"},500)
})

app.use("/sessions/*",requireAuth);
app.use("/chat/*",requireAuth);
app.use("/billing/checkout",requireAuth);
app.use("/billing/portal",requireAuth);

const routes = app.route("/auth",auth)
                  .route("/sessions", sessions)
                  .route("/chat", chat)
                  .route("/billing",billing)
                  
export type AppType = typeof routes;

export default {port: 3000, fetch: app.fetch, idleTimeout: 255};