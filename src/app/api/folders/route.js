import connectDB from "../../../db/dbConfig";
import Folder from "../../../models/floderModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  try {
    const reqBody = await req.json();
    const { owner } = reqBody;

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 400 }
      );
    }

    const folders = await Folder.find({ owner })
      .populate("files")
      .exec();

    return NextResponse.json(
      {
        folders,
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
