import app from "./app.js";
import { prisma } from "./utils/prisma.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`API server running on http://localhost:${PORT}`);

  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});