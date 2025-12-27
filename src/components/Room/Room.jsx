"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import KeepMountedModal from "../modal/RoomModal";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

function Room() {
  const router = useRouter();

  const createRoom = () => {
    const id = uuidv4();
    router.push(`/collaborate/${id}`);
  };

  return (
    <div>
      <div className="flex gap-5 mt-5 items-center">
        <button
          onClick={createRoom}
          className="text-gray-200 px-3 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create Room
        </button>

        <KeepMountedModal />

        <Tooltip title="Work with your team in real time—everyone’s edits are synced instantly.">
          <span>
            <FontAwesomeIcon
              icon={faCircleQuestion}
              className="text-gray-600 cursor-pointer hover:text-gray-500"
              width={16}
            />
          </span>
        </Tooltip>
      </div>
    </div>
  );
}

export default Room;
