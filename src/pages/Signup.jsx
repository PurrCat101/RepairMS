import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, Mail, Lock, AlertCircle, User } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("technician");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate password match
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with Supabase without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        try {
          // Create profile record
          const { error: profileError } = await supabase
            .from("users_profile")
            .insert([
              {
                id: data.user.id,
                full_name: fullName,
                email: email,
                role: role,
              },
            ]);

          if (profileError) throw profileError;

          // Show success message
          setSuccess(true);
          setError("");

          // Clear form
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFullName("");

          // Redirect after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } catch (profileError) {
          // If profile creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(data.user.id);
          throw profileError;
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.message.includes("Email rate limit exceeded")) {
        setError("กรุณารอสักครู่แล้วลองใหม่อีกครั้ง");
      } else if (error.message.includes("User already registered")) {
        setError("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
      } else {
        setError("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 shadow-lg">
            <Wrench className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 drop-shadow-sm">
          RepairMS
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

            {success && (
              <div className="rounded-xl bg-green-50 p-4 animate-fade-in">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      ลงทะเบียนสำเร็จ กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName">ชื่อ-นามสกุล</label>
              <div className="input-icon-wrapper">
                <div className="input-icon">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-with-icon w-full"
                  placeholder="ชื่อ นามสกุล"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role">บทบาท</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full"
                required
              >
                <option value="technician">ช่างเทคนิค</option>
                <option value="officer">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>

            <div>
              <label htmlFor="email">อีเมล</label>
              <div className="input-icon-wrapper">
                <div className="input-icon">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-with-icon w-full"
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
                  className="input-with-icon w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
              <div className="input-icon-wrapper">
                <div className="input-icon">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-with-icon w-full"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || success}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 ${
                  isLoading || success
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02]"
                }`}
              >
                {isLoading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
