import type { RequestHandler } from "express";
import { auth } from "../../auth";
import { fromNodeHeaders } from "better-auth/node";

export async function setupAuth() {
  // Better Auth is already mounted in index.ts via toNodeHandler
}

export function getSession() {
  // No-op: sessions are handled by Better Auth internally
  return null;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).user = session.user;
  (req as any).session_data = session.session;

  return next();
};
