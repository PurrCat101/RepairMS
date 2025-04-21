import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, Mail, Lock, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const { data: userData } = await supabase
          .from("users_profile")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const user = {
          id: data.user.id,
          email: data.user.email,
          ...userData,
        };

        onLogin(user);
        navigate("/");
      }
    } catch (error) {
      setError(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/depo.png" alt="RepairMS Logo" className="h-24 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 drop-shadow-sm">
          ระบบจัดการงานซ่อม
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Repair Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 backdrop-blur-lg bg-opacity-80">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 animate-fade-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email">อีเมล</label>
              <div className="input-icon-wrapper">
                <div className="input-icon">
                  <Mail className="h-7 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-with-icon w-full h-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password">รหัสผ่าน</label>
              <div className="input-icon-wrapper">
                <div className="input-icon">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-with-icon w-full h-10"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02]"
                }`}
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                to="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                ยังไม่มีบัญชี? ลงทะเบียนใช้งาน
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
