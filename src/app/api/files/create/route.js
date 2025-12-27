import connectDB from "@/db/dbConfig";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Folder from "@/models/floderModel";
import File from "@/models/fileModel"

export async function POST(req) {
  await connectDB();

  try {
    const { filename, folderId, language, userId } = await req.json();
    console.log("CREATE FILE REQ BODY:", { filename, folderId, language, userId });

    if (!filename || !folderId || !language || !userId) {
      return NextResponse.json(
        { error: "Please fill all details" },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(folderId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    const existingFile = await File.findOne({
      filename,
      folder: folderId,
    });

    if (existingFile) {
      return NextResponse.json(
        { error: "File already exists" },
        { status: 400 }
      );
    }

    const newFile = await File.create({
      filename,
      language,
      folder: folderId,
      owner: userId,
    });

    await Folder.findByIdAndUpdate(folderId, {
      $push: { files: newFile._id },
    });

    return NextResponse.json(
      { message: "File created successfully", newFile },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE FILE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
