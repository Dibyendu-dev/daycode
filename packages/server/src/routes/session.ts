import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { findSupportedChatModel } from "@daycode/shared";
import { db } from "@daycode/database/client";
import * as Sentry from "@sentry/hono/bun";
import type { AuthenticatedEnv } from "../middleware/require-auth";
import { requireCreditBalance } from "../middleware/require-credits-balance";

const createSessionSchema = z.object({
  title: z.string(),
});

const createSessionValidator = zValidator(
  "json",
  createSessionSchema,
  (result, c) => {
    if (!result.success) {
      Sentry.logger.warn("Session creation validation failed", {
        path: c.req.path,
        issues: result.error.issues.length,
      });
      return c.json(
        {
          error: "Invalid request body",
        },
        400,
      );
    }
  },
);

const app = new Hono<AuthenticatedEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const session = await db.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    Sentry.logger.info("Listed Session", {
      count: session.length,
    });
    return c.json(session);
  })
  .get("/:id", async (c) => {
    // await new Promise((r)=> setTimeout(r, 5000));
    // throw new HTTPException(500,{message: "mock error: session loading failed"})
    const id = c.req.param("id");
    const userId = c.get("userId");

    const session = await db.session.findUnique({
      where: { id, userId },
    });

    if (!session) {
      return c.json({ error: "session not found" }, 404);
    }
    return c.json(session);
  })
  .post("/", createSessionValidator, async (c) => {
    const userId = c.get("userId");
    const data = c.req.valid("json");

    const session = await db.session.create({
      data: {
        ...data,
        userId: userId,
      },
    });
    Sentry.logger.info("Created Session", {
      sessionId: session.id,
      title: session.title,
    });
    return c.json(session, 201);
  });

export default app;
