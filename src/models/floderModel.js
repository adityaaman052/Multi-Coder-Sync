import mongoose from "mongoose";
import File from "./fileModel.js";

const folderSchema = new mongoose.Schema(
  {
    foldername: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: File.modelName,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Folder =
  mongoose.models.Folder || mongoose.model("Folder", folderSchema);

export default Folder;
