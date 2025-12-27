"use client";

import {
  faChevronDown,
  faChevronUp,
  faFolder,
  faFolderOpen,
  faPowerOff,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";
import Image from "next/image";
import { usePlaygroundState } from "@/context/playgroundProvider";
import { FolderModal } from "../modal/FolderModal";
import { NewFileModal } from "../modal/NewFileModal";
import { ModalProvider } from "../ui/animated-modal";
import { EditFolder } from "../modal/EditFolder";

function FolderSection() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [floading, setFloading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [expandedFolderId, setExpandedFolderId] = useState(null);

  const {
    user,
    setUser,
    folders = [],
    setFolders,
    setFiles,
    setSelectedFile,
  } = usePlaygroundState();

  const toggleFolder = (folderId) => {
    setExpandedFolderId((prev) =>
      prev === folderId ? null : folderId
    );
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    try {
      setLoading(true);
      await axios.get("/api/users/logout");
      toast.success("Logged out successfully!");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.log(error);
      toast.error("Error while logging out!");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CREATE FOLDER ---------------- */
  const handleCreateFolder = async (folderName) => {
    try {
      setFloading(true);
      const response = await axios.post("/api/folders/create", {
        foldername: folderName,
        userId: user?._id,
      });

      const newFolder = response.data.newFolder;
      setFolders((prev) => [newFolder, ...prev]);

      toast.success(`Folder "${folderName}" created successfully!`);
    } catch (error) {
      console.log(error);
      toast.error("Error creating folder!");
    } finally {
      setFloading(false);
    }
  };

  /* ---------------- FETCH FOLDERS ---------------- */
  const fetchFolders = async () => {
    try {
      const response = await axios.post("/api/folders", {
        owner: user?._id,
      });
      setFolders(response.data.folders);
    } catch (error) {
      console.log(error);
      toast.error("Error in fetching folders!");
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchFolders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  /* ---------------- DELETE FOLDER ---------------- */
  const deleteFolder = async (folderId) => {
    try {
      await axios.delete("/api/folders/delete", {
        data: { folderId },
      });

      setFolders((prev) =>
        prev.filter((folder) => folder._id !== folderId)
      );

      toast.success("Folder deleted");
    } catch (error) {
      console.log(error);
      toast.error("Error while deleting folder!");
    }
  };

  /* ---------------- EDIT FOLDER ---------------- */
  const handleEditFolder = async (folderName, folderId) => {
    try {
      setEditLoading(true);
      await axios.put("/api/folders/rename", {
        foldername: folderName,
        folderId,
      });
      fetchFolders();
      toast.success("Folder name updated!");
    } catch (error) {
      console.log(error);
      toast.error("Error in updating folder name!");
    } finally {
      setEditLoading(false);
    }
  };

  /* ---------------- CREATE FILE ---------------- */
  const handleFileCreate = async (fileName, folderId, language) => {
    try {
      setFloading(true);

      const response = await axios.post("/api/files/create", {
        filename: fileName,
        folderId,
        language,
        userId: user?._id,
      });

      const newFile = response.data.newFile;

      setFolders((prev) =>
        prev.map((folder) =>
          folder._id === folderId
            ? { ...folder, files: [newFile, ...folder.files] }
            : folder
        )
      );

      if (setFiles) {
        setFiles((prev) => [newFile, ...prev]);
      }

      toast.success("File created successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error in creating file!");
    } finally {
      setFloading(false);
    }
  };

  /* ---------------- DELETE FILE ---------------- */
  const deleteFile = async (fileId) => {
    try {
      await axios.delete("/api/files/delete", {
        data: { fileId },
      });
      toast.success("File deleted successfully!");
      fetchFolders();
    } catch (error) {
      console.log(error);
      toast.error("Error in deleting file!");
    }
  };

  const navigateToIde = (fileId, folderId) => {
    router.push(`/ide/${fileId}/${folderId}`);
  };

  return (
    <ModalProvider>
      <div className="w-full bg-[#d6e4f8] p-10 font-Roboto">
        {/* LOGOUT */}
        <button
          className="px-3 py-2 flex items-center bg-red-500 text-white rounded-md float-right hover:bg-red-700"
          onClick={logout}
        >
          {loading ? (
            <ClipLoader size={20} />
          ) : (
            <>
              <FontAwesomeIcon icon={faPowerOff} width={16} />
              <span className="ml-2">Logout</span>
            </>
          )}
        </button>

        {/* HEADER */}
        <div className="flex w-full justify-between border-b border-black mb-6 p-1">
          <h1 className="text-3xl font-bold">My Folders</h1>
          <FolderModal onCreate={handleCreateFolder} floading={floading} />
        </div>

        {/* FOLDERS */}
        {folders.length > 0 ? (
          [...folders].reverse().map((folder) => (
            <div
              key={folder._id}
              className="flex flex-col border-b border-black mb-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={
                      expandedFolderId === folder._id
                        ? faChevronUp
                        : faChevronDown
                    }
                    onClick={() => toggleFolder(folder._id)}
                    className="cursor-pointer text-gray-600"
                  />
                  <FontAwesomeIcon
                    icon={
                      expandedFolderId === folder._id
                        ? faFolderOpen
                        : faFolder
                    }
                    className="text-yellow-500"
                    size="lg"
                    onClick={() => toggleFolder(folder._id)}
                  />
                  <h2 className="text-xl font-semibold">
                    {folder.foldername}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <EditFolder
                    onEdit={handleEditFolder}
                    editLoading={editLoading}
                    folderId={folder._id}
                  />

                  <div
                    className="w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer"
                    onClick={() => deleteFolder(folder._id)}
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className="text-red-600"
                    />
                  </div>

                  <NewFileModal
                    onCreate={handleFileCreate}
                    floading={floading}
                    folderId={folder._id}
                  />
                </div>
              </div>

              {/* FILES */}
              {expandedFolderId === folder._id &&
                folder.files?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {folder.files.map((file) => (
                      <div
                        key={file._id}
                        className="flex items-center bg-[#b4cade] p-2 rounded-lg cursor-pointer hover:shadow-lg"
                        onClick={() => {
                          setSelectedFile(file);
                          navigateToIde(file._id, folder._id);
                        }}
                      >
                        <Image
                          src="/logo.png"
                          alt="logo"
                          width={40}
                          height={40}
                        />
                        <div className="flex-1 ml-4">
                          <p className="text-lg font-semibold">
                            {file.filename}
                          </p>
                          <p className="text-sm text-gray-600">
                            Language: {file.language}
                          </p>
                        </div>

                        <div
                          className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file._id);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faTrashCan}
                            className="text-red-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {expandedFolderId === folder._id &&
                folder.files?.length === 0 && (
                  <p className="mt-4 text-center text-gray-500">
                    No files
                  </p>
                )}
            </div>
          ))
        ) : (
          <p>No folders</p>
        )}
      </div>
    </ModalProvider>
  );
}

export default FolderSection;
