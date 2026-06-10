import { createMiddleware } from "hono/factory";
import { getAvailableCreditsBalance } from "../lib/polar";
import type { AuthenticatedEnv } from "./require-auth";

export const requireCreditBalance = createMiddleware<AuthenticatedEnv>(async (c, next) => {
    try {
        const userId = c.get("userId");
        const creditBalance = await getAvailableCreditsBalance(userId);
        if (creditBalance <= 0){
            return c.json({error: "No credit remaining. run /upgrade to buy more credits"},402)
        }
        await next();
    } catch (error) {
            return c.json({error: "unable to verify credits balance right now "},503)
        
    }
})