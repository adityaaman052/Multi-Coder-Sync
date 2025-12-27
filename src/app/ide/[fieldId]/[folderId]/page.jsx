"use client";

import { useParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "react-resizable/css/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { usePlaygroundState } from "@/context/playgroundProvider";
import axios, { isAxiosError } from "axios";
import { ModalProvider } from "@/components/ui/animated-modal";
import { EditFile } from "@/components/modal/EditFile";
import LoadingOverlay from "@/components/LoadingOverlay";

const Ide = () => {
  const editorRef = useRef(null);
  const params = useParams();

  const { getFileExtension, selectedFile, setSelectedFile, setFolders, user } =
    usePlaygroundState();

  const { fileId, folderId } = params || {};
  const validFolderId = Array.isArray(folderId) ? folderId[0] : folderId;
  const validFileId = Array.isArray(fileId) ? fileId[0] : fileId;

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileExtension = useMemo(() => {
    return getFileExtension(validFolderId || "", validFileId || "");
  }, [validFolderId, validFileId, getFileExtension]);

  const handleImportCode = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.includes("text")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCode(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportCode = () => {
    const currCode = code.trim();
    if (!currCode) {
      toast.error("Please type some code to export");
      return;
    }
    const blob = new Blob([currCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInput(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportOutput = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleEditorChange = (value) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const fetchFolders = useCallback(async () => {
    try {
      const response = await axios.post("/api/folders/", {
        owner: user?._id,
      });

      setFolders(response.data.folders);

      if (validFolderId && validFileId) {
        const selectedFolder = response.data.folders.find(
          (folder) => folder._id === validFolderId
        );

        if (selectedFolder) {
          const file = selectedFolder.files.find(
            (file) => file._id === validFileId
          );

          if (file) {
            setSelectedFile(file);
            setCode(file.code);
            setLanguage(file.language);
          } else {
            toast.error("File not found");
          }
        } else {
          toast.error("Folder not found");
        }
      }
    } catch (error) {
      toast.error("Error fetching folders");
      console.error(error);
    }
  }, [user?._id, validFolderId, validFileId]);

  useEffect(() => {
    if (user?._id) fetchFolders();
  }, [user?._id, fetchFolders]);

  const editFile = async (fileName, fileId) => {
    try {
      setEditLoading(true);
      await axios.put("/api/files/update", { filename: fileName, fileId });
      fetchFolders();
      toast.success("File name updated!");
    } catch (error) {
      toast.error("Error editing file");
    } finally {
      setEditLoading(false);
    }
  };

  const saveCode = async () => {
    toast.success("Code Saved!");
    await axios.put("/api/files/savecode", {
      code,
      fileId: selectedFile?._id,
    });
  };

  const languageMap = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62,
    c: 50,
  };

  const runCode = async () => {
    setLoading(true);
    const language_id =
      languageMap[selectedFile?.language || "javascript"];

    try {
      const response = await axios.post(
        "https://judge029.p.rapidapi.com/submissions",
        {
          source_code: btoa(code),
          language_id,
          stdin: btoa(input),
        },
        {
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
            "x-rapidapi-host": "judge029.p.rapidapi.com",
            "Content-Type": "application/json",
          },
          params: { base64_encoded: "true", wait: "false" },
        }
      );

      const token = response.data.token;
      if (token) getResult(token);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const getResult = async (token) => {
    try {
      const res = await axios.get(
        `https://judge029.p.rapidapi.com/submissions/${token}`,
        {
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
            "x-rapidapi-host": "judge029.p.rapidapi.com",
          },
          params: { base64_encoded: "true", fields: "*" },
        }
      );

      const result = res.data;
      if (result.status.id <= 2) {
        setTimeout(() => getResult(token), 2000);
      } else {
        setOutput(atob(result.stdout || result.stderr || ""));
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (editorRef.current) editorRef.current.layout();
    window.addEventListener("resize", () =>
      editorRef.current?.layout()
    );
    return () => window.removeEventListener("resize", () => {});
  }, []);

  return (
    <ModalProvider>
      <div className="flex flex-col w-full h-screen bg-gray-900">
        {/* NAVBAR */}
        <div className="h-16 flex items-center justify-between px-4 bg-gray-800 text-white">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={48} height={48} />
            <h1 className="font-bebas text-xl">CodingCorner</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={saveCode} className="btn-blue">Save</button>
            <button onClick={runCode} className="btn-green">Run</button>
          </div>
        </div>

        {/* EDITOR */}
        <Editor
          height="100%"
          value={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={(editor) => (editorRef.current = editor)}
          defaultLanguage={selectedFile?.language}
        />

        <LoadingOverlay loading={loading} />
      </div>
    </ModalProvider>
  );
};

export default Ide;
