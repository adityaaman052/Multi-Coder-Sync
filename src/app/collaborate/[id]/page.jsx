"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { getSocket } from "../../../config/socket";
import { useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { usePlaygroundState } from "@/context/playgroundProvider";

const CollaborativePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [code, setCode] = useState("// Write your code here");
  const [clients, setClients] = useState([]);
  const editorRef = useRef(null);
  const socketRef = useRef(null);

  const { user } = usePlaygroundState();
  const [language, setLanguage] = useState("javascript");

  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (!user || !id) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.connect();
    socket.emit("join", { id, user });

    socket.on("joined", ({ clients, username, socketId }) => {
      if (username !== user.username) {
        toast.success(`${username} joined!`);
      }

      setClients(clients);

      // Sync code to new client
      if (clients.length > 1) {
        socket.emit("syncCode", {
          socketId,
          code,
        });
      }
    });

    socket.on("disconnected", ({ socketId, username }) => {
      toast.error(`${username} left!`);
      setClients((prev) =>
        prev.filter((c) => c.socketId !== socketId)
      );
    });

    socket.on("codeChange", (newCode) => {
      setCode(newCode);
      if (editorRef.current) {
        editorRef.current.setValue(newCode);
      }
    });

    socket.on("changeLanguage", (newLanguage) => {
      setLanguage(newLanguage);
    });

    return () => {
      socket.disconnect();
      socket.off("joined");
      socket.off("disconnected");
      socket.off("codeChange");
      socket.off("changeLanguage");
      socket.off("syncCode");
    };
  }, [user, id]);

  const handleEditorChange = (value) => {
    if (value !== undefined && socketRef.current) {
      setCode(value);
      socketRef.current.emit("codeChange", {
        id,
        code: value,
      });
    }
  };

  const changeLanguage = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socketRef.current.emit("changeLanguage", {
      id,
      language: newLanguage,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-700">
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        client={clients}
        id={id}
      />

      <div
        className={`grow flex flex-col ${
          sidebarOpen ? "ml-64" : "ml-16"
        } transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
          <select
            className="bg-gray-200 text-black font-bold py-2 px-4 rounded"
            value={language}
            onChange={changeLanguage}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
        </div>

        <div className="grow h-full w-full">
          <Editor
            value={code}
            language={language}
            theme="my-dark-theme"
            className="w-full h-full"
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 16,
              padding: { top: 5 },
              wordWrap: "on",
            }}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme("my-dark-theme", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                  "editor.background": "#1f2937",
                },
              });
            }}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CollaborativePage;
