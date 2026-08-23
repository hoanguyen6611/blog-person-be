import crypto from "crypto";

const VISITOR_COOKIE = "visitor_id";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const identifyVisitor = (req, res, next) => {
  let visitorId = req.cookies?.[VISITOR_COOKIE];
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookie(VISITOR_COOKIE, visitorId, {
      maxAge: ONE_YEAR_MS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
  }
  req.visitorId = visitorId;
  next();
};

export default identifyVisitor;
