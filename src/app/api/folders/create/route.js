import connectDB from "../../../../db/dbConfig";
import Folder from "@/models/floderModel"
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  try {
    const reqBody = await req.json();
    const { foldername, userId } = reqBody;

    if (!foldername) {
      return NextResponse.json(
        { error: "Please give folder name" },
        { status: 400 }
      );
    }

    const folder = await Folder.create({
      foldername,
      owner: userId,
    });

    const newFolder = await Folder.findById(folder._id)
      .populate("owner", "username email")
      .exec();

    return NextResponse.json(
      {
        message: "Folder created successfully!",
        newFolder,
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
