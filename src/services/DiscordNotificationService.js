class DiscordNotificationService {
  constructor() {
    this.webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    this.supabase = null;
    console.log(
      "Discord Webhook URL:",
      this.webhookUrl ? "Configured" : "Not configured"
    );
  }

  initialize(supabase) {
    this.supabase = supabase;
  }

  async getUserFullName(userId) {
    if (!userId || !this.supabase) return "ไม่ระบุ";

    try {
      const { data, error } = await this.supabase
        .from("users_profile")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data?.full_name || "ไม่ระบุ";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "ไม่ระบุ";
    }
  }

  async getUserRole(userId) {
    if (!userId || !this.supabase) return "ไม่ระบุ";

    try {
      const { data, error } = await this.supabase
        .from("users_profile")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const roleMap = {
        admin: "ผู้ดูแลระบบ",
        officer: "เจ้าหน้าที่",
        technician: "ช่างเทคนิค",
      };

      return roleMap[data?.role] || "ไม่ระบุ";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return "ไม่ระบุ";
    }
  }

  formatDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  async sendToDiscord(message) {
    try {
      if (!this.webhookUrl) {
        console.error("Discord webhook URL is not configured");
        return;
      }

      console.log("Sending to Discord:", message);
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
        }),
      });

      console.log("Discord API response status:", response.status);
      if (!response.ok) {
        throw new Error(`Discord API returned ${response.status}`);
      }

      console.log("Message sent successfully to Discord");
      return true;
    } catch (error) {
      console.error("Error sending notification to Discord:", error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const message = "🔧 ทดสอบการเชื่อมต่อ Discord Webhook";
      await this.sendToDiscord(message);
      return true;
    } catch (error) {
      console.error("Test connection failed:", error);
      return false;
    }
  }

  async sendNewTaskNotification(deviceName, issue) {
    const datetime = this.formatDateTime();
    const message = `🔔 งานซ่อมใหม่\n📱 อุปกรณ์: ${deviceName}\n🔧 ปัญหา: ${issue}\n⏰ เวลา: ${datetime}`;
    return this.sendToDiscord(message);
  }

  async sendStatusChangeNotification(
    deviceName,
    issue,
    newStatus,
    changerName,
    changerRole
  ) {
    const datetime = this.formatDateTime();
    const statusEmoji = newStatus === "completed" ? "✅" : "❌";
    const statusThai =
      newStatus === "completed" ? "เสร็จสิ้น" : "ไม่สามารถซ่อมได้";
    const message = `${statusEmoji} สถานะงานเปลี่ยนแปลง\n📱 อุปกรณ์: ${deviceName}\n🔧 ปัญหา: ${issue}\n📝 สถานะใหม่: ${statusThai}\n👤 ดำเนินการโดย: ${changerName} \n⏰ เวลา: ${datetime}`;
    return this.sendToDiscord(message);
  }

  async sendTaskAssignedNotification(
    deviceName,
    issue,
    assignerName,
    assignerRole,
    technicianName,
    technicianRole
  ) {
    const datetime = this.formatDateTime();
    const message = `📋 การมอบหมายงานใหม่\n📱 อุปกรณ์: ${deviceName}\n🔧 ปัญหา: ${issue}\n👤 มอบหมายโดย: ${assignerName} (${assignerRole})\n🔨 ผู้รับผิดชอบ: ${technicianName} \n⏰ เวลา: ${datetime}`;
    return this.sendToDiscord(message);
  }
}

export default new DiscordNotificationService();
