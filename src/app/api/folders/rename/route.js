import connectDB from "../../../../db/dbConfig";
import Folder from "../../../../models/floderModel";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await connectDB();

  try {
    const reqBody = await req.json();
    const { foldername, folderId } = reqBody;

    if (!foldername || !folderId) {
      return NextResponse.json(
        { error: "Folder name and folder id are required" },
        { status: 400 }
      );
    }

    const folder = await Folder.findByIdAndUpdate(
      folderId,
      { $set: { foldername } },
      { new: true }
    ).populate("owner", "username email");

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Folder name updated",
        folder,
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
