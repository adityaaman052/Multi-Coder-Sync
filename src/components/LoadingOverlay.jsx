"use client";

import React from "react";
import { ScaleLoader } from "react-spinners";

const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <ScaleLoader color="#3498db" loading={loading} />
    </div>
  );
};

export default LoadingOverlay;
