import { supabase } from "../lib/supabase";
import discordService from "./DiscordNotificationService";

export const NotificationTypes = {
  NEW_TASK: "new_task",
  STATUS_CHANGE: "status_change",
  TASK_ASSIGNED: "task_assigned",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
};

class NotificationService {
  async createNotification(notification) {
    try {
      console.log("Creating notification:", notification);
      const { data, error } = await supabase
        .from("notifications")
        .insert(notification)
        .select();

      if (error) {
        console.error("Error inserting notification:", error);
        throw error;
      }
      console.log("Successfully inserted notification:", data);
      return data;
    } catch (err) {
      console.error("Error in createNotification:", err);
      throw err;
    }
  }

  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
      throw error;
    }
  }

  async markAllAsRead(notificationIds) {
    try {
      if (!notificationIds?.length) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", notificationIds);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error.message);
      throw error;
    }
  }

  async fetchNotifications(
    userId,
    userRole,
    options = { limit: 50, offset: 0 }
  ) {
    try {
      console.log("Fetching notifications for user:", {
        userId,
        role: userRole,
        options,
      });

      let query = supabase.from("notifications").select("*");

      // เงื่อนไขการเข้าถึงการแจ้งเตือน
      if (userRole === "admin") {
        // Admin เห็นทุกการแจ้งเตือนที่มี for_role = 'admin' หรือเป็นการแจ้งเตือนส่วนตัว
        query = query.or(`recipient_id.eq.${userId},for_role.eq.admin`);
      } else {
        // ผู้ใช้ทั่วไปเห็นเฉพาะการแจ้งเตือนส่วนตัว
        query = query.eq("recipient_id", userId);
      }

      // เรียงลำดับตามเวลาล่าสุด และจำกัดจำนวน
      query = query
        .order("created_at", { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      console.log("Fetched notifications:", {
        count: data?.length || 0,
        notifications: data,
      });

      return this.removeDuplicateNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      throw error;
    }
  }

  // Helpers
  removeDuplicateNotifications(notifications) {
    return notifications.reduce((acc, curr) => {
      const existingNotification = acc.find(
        (n) =>
          n.task_id === curr.task_id &&
          n.type === curr.type &&
          n.message === curr.message
      );
      if (!existingNotification) {
        acc.push(curr);
      }
      return acc;
    }, []);
  }

  // Notification creators
  async createNewTaskNotification(creatorId, deviceName, issue, taskId) {
    // ส่งการแจ้งเตือนไปยัง Discord
    await discordService.sendNewTaskNotification(deviceName, issue);

    return this.createNotification({
      recipient_id: creatorId,
      title: "งานซ่อมใหม่",
      message: `มีการเพิ่มงานซ่อมใหม่: ${deviceName} - ${issue}`,
      type: NotificationTypes.NEW_TASK,
      task_id: taskId,
      read: false,
      created_at: new Date().toISOString(),
      for_role: "admin",
    });
  }

  async createStatusChangeNotification(
    changerId,
    deviceName,
    issue,
    newStatus,
    changerName,
    changerRole,
    taskId
  ) {
    // ส่งการแจ้งเตือนไปยัง Discord พร้อมข้อมูลบทบาท
    await discordService.sendStatusChangeNotification(
      deviceName,
      issue,
      newStatus,
      changerName,
      changerRole
    );

    const status = newStatus === "completed" ? "เสร็จสิ้น" : "ไม่สามารถซ่อมได้";
    return this.createNotification({
      recipient_id: changerId,
      title: "สถานะงานเปลี่ยนแปลง",
      message: `งานซ่อม ${deviceName} - ${issue} ถูกเปลี่ยนสถานะเป็น${status} โดย ${changerName}`,
      type: NotificationTypes.STATUS_CHANGE,
      task_id: taskId,
      read: false,
      created_at: new Date().toISOString(),
      for_role: "admin",
    });
  }

  async createTaskAssignedNotification(
    technicianId,
    deviceName,
    issue,
    taskId,
    assignerName,
    assignerRole,
    technicianName,
    technicianRole
  ) {
    await discordService.sendTaskAssignedNotification(
      deviceName,
      issue,
      assignerName,
      assignerRole,
      technicianName,
      technicianRole
    );

    return this.createNotification({
      recipient_id: technicianId,
      title: "ได้รับมอบหมายงานใหม่",
      message: `คุณได้รับมอบหมายให้ซ่อม ${deviceName} - ${issue} โดย ${assignerName}`,
      type: NotificationTypes.TASK_ASSIGNED,
      task_id: taskId,
      read: false,
      created_at: new Date().toISOString(),
    });
  }

  async createUserUpdateNotification(
    updaterId,
    email,
    fullName,
    role,
    updaterName,
    updaterRole
  ) {
    await discordService.sendUserUpdateNotification(
      email,
      fullName,
      role,
      updaterName,
      updaterRole
    );

    return this.createNotification({
      recipient_id: updaterId,
      title: "อัปเดตข้อมูลผู้ใช้",
      message: `ข้อมูลผู้ใช้ ${email} (${fullName}) ถูกอัปเดตโดย ${updaterName}`,
      type: NotificationTypes.USER_UPDATED,
      read: false,
      created_at: new Date().toISOString(),
      for_role: "admin",
    });
  }

  async createUserDeleteNotification(
    deleterId,
    email,
    fullName,
    role,
    deleterName,
    deleterRole
  ) {
    await discordService.sendUserDeleteNotification(
      email,
      fullName,
      role,
      deleterName,
      deleterRole
    );

    return this.createNotification({
      recipient_id: deleterId,
      title: "ลบข้อมูลผู้ใช้",
      message: `ข้อมูลผู้ใช้ ${email} (${fullName}) ถูกลบโดย ${deleterName}`,
      type: NotificationTypes.USER_DELETED,
      read: false,
      created_at: new Date().toISOString(),
      for_role: "admin",
    });
  }
}

export default new NotificationService();
