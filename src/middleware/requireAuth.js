import { requireAuth as clerkRequireAuth } from "@clerk/express";

// Thin re-export so the rest of the codebase imports from one place,
// same pattern as the rest of your route files.
export const requireAuth = clerkRequireAuth();