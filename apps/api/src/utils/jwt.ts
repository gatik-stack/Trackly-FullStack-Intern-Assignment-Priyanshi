import jwt from "jsonwebtoken";
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}
export function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    getJwtSecret(),
    { expiresIn: "1d" },
  );
}
export function verifyToken(token: string) {
  return jwt.verify(
    token,
    getJwtSecret(),
  ) as { userId: string };
}