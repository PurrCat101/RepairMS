import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wrench, LogOut, User } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Navbar({ navigation, onLogout, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onLogout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <nav className="fixed w-full bg-white shadow-lg z-50">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Wrench className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                RepairMS
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      location.pathname === item.href
                        ? "border-b-2 border-indigo-500 text-gray-900"
                        : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="flex items-center cursor-pointer p-2 rounded-full hover:bg-gray-100">
                <User className="h-5 w-5 text-gray-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.full_name || "ผู้ใช้งาน"}
                </span>
              </div>
              <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs font-medium text-indigo-600 mt-1">
                    {user?.role === "admin"
                      ? "ผู้ดูแลระบบ"
                      : user?.role === "technician"
                      ? "ช่างเทคนิค"
                      : user?.role === "officer"
                      ? "เจ้าหน้าที่"
                      : "ผู้ใช้งาน"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
