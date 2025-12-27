import Folder from "@/models/floderModel";
import connectDB from "../../../../db/dbConfig";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  await connectDB();

  try {
    const reqBody = await req.json();
    const { folderId } = reqBody;

    if (!folderId) {
      return NextResponse.json(
        { error: "Folder id is required" },
        { status: 400 }
      );
    }

    const folder = await Folder.findByIdAndDelete(folderId);

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Folder deleted successfully!",
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
