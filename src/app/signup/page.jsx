"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onSignUp = async () => {
    if (!user.username || !user.email || !user.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user.email.endsWith("@gmail.com")) {
      toast.error("Please enter a valid Gmail address.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/users/signup", {
        username: user.username,
        email: user.email,
        password: user.password,
      });

      toast.success("User registered successfully");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || "Registration failed"
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
      onSignUp();
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e7f0fd]">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 md:p-8">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/logo.png"
            alt="CodingCorner Logo"
            width={48}
            height={48}
            priority
          />
          <h1 className="font-bebas text-3xl text-gray-900">
            CodingCorner
          </h1>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={user.username}
              onChange={(e) =>
                setUser({ ...user, username: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
              onKeyUp={handleInputEnter}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={user.password}
              onChange={(e) =>
                setUser({ ...user, password: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="button"
            onClick={onSignUp}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <ClipLoader size={22} color="white" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
