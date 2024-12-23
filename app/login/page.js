"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../_components/Spinner";
import { useTable } from "../_contexts/TableContext";

export default function Page() {
  const [user, setUser] = useState({ userId: "manager", password: "1234" });
  const [showPassword, setShowPassword] = useState(false);

  const { setToken, loginLoading, setLoginLoading } = useTable();

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { userId: userName, password } = user;

    const data = {
      companyDB: "",
      userName,
      password,
    };

    try {
      setLoginLoading(true);

      const res = await fetch(`http://182.191.88.73:9000/api/Login`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const responseData = await res.json();
        localStorage.setItem("isLogin", true);
        setToken(responseData?.Token);
        router.push("/menu");
        setLoginLoading(false);
      } else {
        const errorData = await res.json();
        setLoginLoading(false);
        toast.error(errorData.error || "Failed to login");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setUser({ userId: "", password: "" });
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center text-sm">
      {loginLoading && <Spinner />}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl border border-stone-200">
        <header className="border-b-8 border-yellow-500 bg-stone-300 py-2">
          <h1 className="font-semibold text-center">InnoNex</h1>
        </header>
        <main className="bg-white grid grid-cols-1 lg:grid-cols-[18rem_1fr]">
          {/* Image of a woman working on a laptop */}
          <div className="relative h-64 lg:h-auto">
            <Image
              unoptimized
              src="/women-working.jpg"
              alt="Woman working on SAP"
              fill
              quality={50}
              priority
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center p-6">
            {/* SAP logo */}
            <div className="flex justify-center mb-6">
              <Image
                unoptimized
                src="/logo.jpg"
                alt="InnoNex logo"
                height="100"
                width="100"
                quality={50}
              />
            </div>
            {/* Login form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Company name container */}
              <div className="flex flex-col">
                <label>Company Name:</label>
                <input
                  type="text"
                  placeholder="AKA"
                  disabled
                  name="companyName"
                  className="px-3 py-2 border rounded-sm focus:outline-yellow-500"
                />
              </div>
              {/* User ID container */}
              <div className="flex flex-col">
                <label>User ID:</label>
                <input
                  type="text"
                  name="userId"
                  className="px-3 py-2 border rounded-sm focus:outline-yellow-500"
                  value={user.userId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* Password container */}
              <div className="flex flex-col relative">
                <label>Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="px-3 py-2 border rounded-sm focus:outline-yellow-500"
                  value={user.password}
                  onChange={handleInputChange}
                  required
                />

                <span
                  className="absolute right-2 top-7 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </span>
              </div>

              {/* Buttons container */}
              <footer className="flex items-center justify-center mt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-b from-yellow-300 to-yellow-500 px-6 py-2 rounded-sm focus:outline-yellow-500"
                >
                  Login
                </button>
              </footer>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
