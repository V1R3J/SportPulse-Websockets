import { Router } from "express";
import { desc } from "drizzle-orm";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js";
import { getMatchStatus } from "../utils/match-status.js";

export const matchRouter = Router();
const MAX_LIMIT = 100; // maximum limit for pagination

matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten(),
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT); // default to 50 if not provided, max 100

  try {
    const rows = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    // Refresh status per match based on current time before returning
    const data = rows.map((match) => ({
      ...match,
      status: getMatchStatus(match.startTime, match.endTime) ?? match.status,
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.issues });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    // Sync the match status to any connected WebSocket clients
    if (res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json({ data: event });
  } catch (error) {
    console.error("Failed to create match:", error);
    res.status(500).json({ error: "Failed to create match" });
  }
});
