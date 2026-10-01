import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  publicUser,
} from "@/lib/auth";
import { User } from "@/lib/models/User";

export async function POST(request) {
  try {
    await connectDB();
    await ensureSeeded();
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["creator", "client"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      courseGraduate: role === "creator",
      headline:
        role === "creator"
          ? "AI video creator"
          : "Looking for AI video talent",
    });

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
