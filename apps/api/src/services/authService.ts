import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(
      "Email is already registered",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "MEMBER",
    },
    select: publicUserSelect,
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      "UNAUTHORIZED",
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError(
      "Invalid email or password",
      401,
      "UNAUTHORIZED",
    );
  }

  return {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
};
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 401, "UNAUTHORIZED");
  }

  return user;
}