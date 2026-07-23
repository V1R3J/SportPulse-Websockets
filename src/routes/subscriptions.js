import { Router } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { userSportSubscriptions } from "../db/schema.js";
import { requireAuth } from "../middleware/requireAuth.js";

const VALID_SPORTS = ["football", "basketball", "cricket", "tennis"];

export const subscriptionsRouter = Router();

// Get the logged-in user's saved sports
subscriptionsRouter.get("/", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const rows = await db
      .select({ sport: userSportSubscriptions.sport })
      .from(userSportSubscriptions)
      .where(eq(userSportSubscriptions.userId, userId));

    res.status(200).json({ sports: rows.map((r) => r.sport) });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions." });
  }
});

// Replace the logged-in user's saved sports with a new list
subscriptionsRouter.put("/", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const { sports } = req.body;

  if (!Array.isArray(sports) || sports.some((s) => !VALID_SPORTS.includes(s))) {
    return res.status(400).json({ error: "Invalid sports list.", validSports: VALID_SPORTS });
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(userSportSubscriptions).where(eq(userSportSubscriptions.userId, userId));
      if (sports.length > 0) {
        await tx.insert(userSportSubscriptions).values(
          sports.map((sport) => ({ userId, sport }))
        );
      }
    });

    res.status(200).json({ sports });
  } catch (error) {
    console.error("Failed to update subscriptions:", error);
    res.status(500).json({ error: "Failed to update subscriptions." });
  }
});