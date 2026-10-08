import { Request, Response, NextFunction } from "express";
import {
  getUserById,
  loginUser,
  registerUser,
} from "../services/authService.js";
import { generateToken } from "../utils/jwt.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    res.status(201).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    const token = generateToken(user.id);

    res.cookie("trackly_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}
export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      throw new Error("User ID is missing");
    }

    const user = await getUserById(userId);

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}

export function logout(
  _req: Request,
  res: Response,
) {
  res.clearCookie("trackly_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.status(204).send();
}