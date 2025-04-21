import { supabase } from "./supabase";

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // ดึงข้อมูล user profile จากตาราง users_profile
    const { data: userProfile, error } = await supabase
      .from("users_profile")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return {
      ...user,
      ...userProfile,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
