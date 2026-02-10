"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import Link from "next/link";
import { PencilLine, Github } from "lucide-react";

export default function Signup() {
  return (
    <div className="min-h-screen grainy flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-12">
          <div className="bg-black p-2 rounded-lg">
            <PencilLine className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight">Doodlezz</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white border-4 border-black p-10 rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#FFC88A]" />
          
          <h1 className="text-4xl font-black mb-2 text-black">Join the Club! ✨</h1>
          <p className="text-gray-600 font-bold mb-8">Start your collaborative journey.</p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <Input 
              label="Full Name" 
              placeholder="Your Name" 
              type="text"
              required
            />
            
            <Input 
              label="Email Address" 
              placeholder="sketcher@doodlezz.com" 
              type="email"
              required
            />
            
            <Input 
              label="Password" 
              placeholder="••••••••" 
              type="password"
              required
            />

            <Button variant="pastel-orange" className="w-full py-4 text-lg mt-2" type="submit">
              Create Account
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 font-bold">OR SIGN UP WITH</span>
            </div>
          </div>

          <div className="mt-8">
             <Button variant="secondary" className="w-full flex items-center justify-center gap-3 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                <Github className="w-5 h-5" />
                <span>GitHub</span>
             </Button>
          </div>
        </div>

        <p className="text-center mt-10 font-bold text-gray-600">
          Already have an account?{" "}
          <Link href="/signin" className="text-black hover:underline underline-offset-4 decoration-2">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
