"use client";

import React from "react";
import FolderSection from "@/components/HomeScreens/FolderSection";
import HomeScreen from "@/components/HomeScreens/HomeScreen";

function HomePage() {
  return (
    <div className="flex flex-col sm:flex-row w-full h-screen">
      <HomeScreen />
      <FolderSection />
    </div>
  );
}

export default HomePage;
