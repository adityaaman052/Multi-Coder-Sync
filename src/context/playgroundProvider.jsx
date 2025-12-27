"use client";

import React, {
  useContext,
  createContext,
  useState,
  useEffect,
} from "react";

const playgroundContext = createContext(undefined);

export const PlaygroundProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const getFileExtension = (folderId, fileId) => {
    for (let i = 0; i < folders.length; i++) {
      if (folders[i]._id === folderId) {
        for (let j = 0; j < folders[i].files.length; j++) {
          const currFile = folders[i].files[j];
          if (currFile._id === fileId) {
            switch (currFile.language) {
              case "javaScript":
                return ".js";
              case "python":
                return ".py";
              case "cpp":
                return ".cpp";
              case "java":
                return ".java";
              case "c":
                return ".c";
              default:
                return ".txt";
            }
          }
        }
      }
    }
    return ".txt";
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.log("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  return (
    <playgroundContext.Provider
      value={{
        user,
        setUser,
        folders,
        setFolders,
        files,
        setFiles,
        getFileExtension,
        selectedFile,
        setSelectedFile,
      }}
    >
      {children}
    </playgroundContext.Provider>
  );
};

export const usePlaygroundState = () => {
  const context = useContext(playgroundContext);
  if (!context) {
    throw new Error(
      "usePlaygroundState must be used within a PlaygroundProvider"
    );
  }
  return context;
};
