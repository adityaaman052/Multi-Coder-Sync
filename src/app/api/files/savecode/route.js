import connectDB from "../../../../db/dbConfig";
import File from "../../../../models/fileModel";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await connectDB();

  try {
    const reqBody = await req.json();
    const { code, fileId } = reqBody;

    if (!fileId) {
      return NextResponse.json(
        { error: "File id is required" },
        { status: 400 }
      );
    }

    const file = await File.findByIdAndUpdate(
      fileId,
      { $set: { code } },
      { new: true }
    )
      .populate("owner", "username email")
      .exec();

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Code saved successfully!",
        file,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
