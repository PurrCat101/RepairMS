import React, { useState, useRef, useEffect } from "react";
import { Bell, X, ChevronDown } from "lucide-react";
import NotificationService from "../services/NotificationService";

export default function NotificationPopover({
  notifications,
  unreadCount,
  setNotifications,
  setUnreadCount,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const notificationRef = useRef(null);

  // จัดกลุ่มการแจ้งเตือนตามวันที่
  const groupNotificationsByDate = (notifications) => {
    const groups = {};
    notifications.forEach((notification) => {
      const date = new Date(notification.created_at).toLocaleDateString(
        "th-TH",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    return groups;
  };

  const handleShowMore = () => {
    setShowAll(true);
    // รอให้ DOM อัพเดทก่อนแล้วค่อย scroll
    setTimeout(() => {
      if (notificationRef.current) {
        notificationRef.current.scrollTop =
          notificationRef.current.scrollHeight;
      }
    }, 100);
  };

  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length === 0) return;

      await NotificationService.markAllAsRead(
        unreadNotifications.map((n) => n.id)
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error.message);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="sticky top-0 bg-white px-4 py-2 border-b z-10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">การแจ้งเตือน</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  อ่านทั้งหมด
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={notificationRef}
            className="max-h-[calc(100vh-200px)] overflow-y-auto"
          >
            {notifications.length > 0 ? (
              Object.entries(
                groupNotificationsByDate(
                  showAll ? notifications : notifications.slice(0, 3)
                )
              ).map(([date, groupedNotifications]) => (
                <div key={date} className="border-b last:border-b-0">
                  <div className="px-4 py-2 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500">{date}</p>
                  </div>
                  {groupedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(
                              notification.created_at
                            ).toLocaleTimeString("th-TH")}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            อ่านแล้ว
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                ไม่มีการแจ้งเตือนใหม่
              </div>
            )}

            {!showAll && notifications.length > 3 && (
              <button
                onClick={handleShowMore}
                className="w-full px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50 flex items-center justify-center"
              >
                ดูทั้งหมด <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
