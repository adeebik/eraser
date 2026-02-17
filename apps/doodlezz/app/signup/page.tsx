"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { useRef, useState } from "react";
import axios from "axios";
import { Alert } from "@repo/ui/alert";
import { useRouter } from "next/navigation";
import { BE_URL } from "@/config/config";

export default function Signup() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const handleCreateAcc = async () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const name = nameRef.current?.value;

    if (!email || !password || !name) {
      setAlert({
        type: "error",
        title: "Missing Fields",
        message: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await axios.post(`${BE_URL}/user/signup`, {
        email,
        password,
        name,
      });

      if (response.status === 200) {
        setAlert({
          type: "success",
          title: "Welcome",
          message: response.data.msg || "Account created successfully!",
        });

        setTimeout(() => {
          router.push("/signin");
        }, 1500);
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Signup Failed",
        message:
          error.response?.data?.msg ||
          "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen grainy flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-12">
          <div className="bg-black p-2 rounded-lg">
            <PencilLine className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight">Doodlezz</span>
        </div>

        {/* Form Card */}
        <div className="bg-white border-4 border-black p-10 rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#FFC88A]" />

          <h1 className="text-4xl font-black mb-2 text-black">
            Join the Club! ✨
          </h1>
          <p className="text-gray-600 font-bold mb-8">
            Start your collaborative journey.
          </p>

          {alert && (
            <div className="mb-6">
              <Alert
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          <div className="space-y-6">
            <Input
              ref={nameRef}
              label="Name"
              placeholder="doodlezz"
              type="text"
              required
            />

            <Input
              ref={emailRef}
              label="Email Address"
              placeholder="sketcher@doodlezz.com"
              type="email"
              required
            />

            <Input
              ref={passwordRef}
              label="Password"
              placeholder="••••••••"
              type="password"
              required
            />

            <Button
              onClick={handleCreateAcc}
              variant="pastel-orange"
              className="w-full py-4 text-lg mt-2"
              type="submit"
            >
              Create Account
            </Button>
          </div>
        </div>

        <p className="text-center mt-10 font-bold text-gray-600">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-black hover:underline underline-offset-4 decoration-2"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
