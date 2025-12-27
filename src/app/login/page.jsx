"use client";

import { usePlaygroundState } from "@/context/playgroundProvider";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";

function Page() {
  const { setUser } = usePlaygroundState();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user1, setUser1] = useState({
    email: "",
    password: "",
    _id: "",
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser1(JSON.parse(storedUser));
      }
    }
  }, []);

  const onLogin = async () => {
    if (!user1.email || !user1.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user1.email.endsWith("@gmail.com")) {
      toast.error("Please enter a valid Gmail address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/users/login", {
        email: user1.email,
        password: user1.password,
      });

      const data = response.data.user;

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data));
      }

      setUser(data);
      toast.success("Login successful!");
      router.push("/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || "Login failed"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e7f0fd]">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 md:p-8">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Logo"
            width={64}
            height={64}
            priority
          />
          <h1 className="text-3xl font-bebas text-gray-900">
            CodingCorner
          </h1>
        </div>

        <form className="space-y-6 font-Roboto" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={user1.email ?? ""}
              onChange={(e) =>
                setUser1({ ...user1, email: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
              onKeyUp={handleInputEnter}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={user1.password ??""}
              onChange={(e) =>
                setUser1({ ...user1, password: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <button
            type="button"
            onClick={onLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <ClipLoader size={22} color="white" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2">
          <p className="text-sm text-gray-600">Create Account :</p>
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Page;
