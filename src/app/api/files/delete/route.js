import connectDB from "../../../../db/dbConfig";
import File from "../../../../models/fileModel";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  await connectDB();

  try {
    const reqBody = await req.json();
    const { fileId } = reqBody;

    if (!fileId) {
      return NextResponse.json(
        { error: "File id is required" },
        { status: 400 }
      );
    }

    await File.findByIdAndDelete(fileId);

    return NextResponse.json(
      {
        message: "File deleted successfully",
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
