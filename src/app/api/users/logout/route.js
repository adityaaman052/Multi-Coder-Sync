import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json(
      {
        message: "User logged out successfully",
      },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0), // immediately expire cookie
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
