import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import UserFormModal from "../components/UserFormModal";
import notificationService from "../services/NotificationService";
import DeleteModal from "../components/RepairTasks/DeleteModal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users_profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users data");
    } finally {
      setLoading(false);
    }
  }

  async function addUser(event) {
    event.preventDefault();
    try {
      const { data, error } = await supabase
        .from("users_profile")
        .insert([{ email, full_name: fullName, role }]);

      if (error) {
        throw error;
      }

      setUsers((prevUsers) => [...prevUsers, ...data]);
      setEmail("");
      setFullName("");
      setRole("");
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setShowForm(false);
    }
  }

  async function updateUser(event) {
    event.preventDefault();
    if (!editingUser || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from("users_profile")
        .update({ email, full_name: fullName, role })
        .eq("id", editingUser.id);

      if (error) {
        throw error;
      }

      // Send notification
      await notificationService.createUserUpdateNotification(
        currentUser.id,
        email,
        fullName,
        role,
        currentUser.full_name,
        currentUser.role
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? { ...user, email, full_name: fullName, role }
            : user
        )
      );
      setEmail("");
      setFullName("");
      setRole("");
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setShowForm(false);
    }
  }

  async function deleteUser(userId) {
    if (!currentUser) return;

    try {
      // Get user data before deletion
      const userToDelete = users.find((user) => user.id === userId);
      if (!userToDelete) throw new Error("User not found");

      const { error } = await supabase
        .from("users_profile")
        .delete()
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Send notification
      await notificationService.createUserDeleteNotification(
        currentUser.id,
        userToDelete.email,
        userToDelete.full_name,
        userToDelete.role,
        currentUser.full_name,
        currentUser.role
      );

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        รายชื่อผู้ใช้งาน
      </h1>
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingUser(null);
            setEmail("");
            setFullName("");
            setRole("");
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 my-4"
        >
          Add User
        </button>
      </div>
      <UserFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingUser(null);
          setEmail("");
          setFullName("");
          setRole("");
        }}
        onSubmit={editingUser ? updateUser : addUser}
        editingUser={editingUser}
        email={email}
        setEmail={setEmail}
        fullName={fullName}
        setFullName={setFullName}
        role={role}
        setRole={setRole}
      />{" "}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onDelete={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }
        }}
        message={`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${
          userToDelete?.full_name || ""
        }" ออกจากระบบ?`}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString("th-TH")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setEmail(user.email);
                      setFullName(user.full_name);
                      setRole(user.role);
                      setShowForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user);
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
