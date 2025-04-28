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

  async sendToDiscord(embed) {
    try {
      if (!this.webhookUrl) {
        console.error("Discord webhook URL is not configured");
        return;
      }

      console.log("Sending to Discord:", embed);
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
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
      const embed = {
        title: "🔧 ทดสอบการเชื่อมต่อ",
        description: "ทดสอบการเชื่อมต่อ Discord Webhook",
        color: 0x00ff00, // สีเขียว
        timestamp: new Date().toISOString(),
      };
      await this.sendToDiscord(embed);
      return true;
    } catch (error) {
      console.error("Test connection failed:", error);
      return false;
    }
  }

  async sendNewTaskNotification(deviceName, issue) {
    const embed = {
      title: "🔔 งานซ่อมใหม่",
      color: 0x3498db, // สีฟ้า
      fields: [
        {
          name: "📱 อุปกรณ์",
          value: deviceName,
          inline: true,
        },
        {
          name: "🔧 ปัญหา",
          value: issue,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    };
    return this.sendToDiscord(embed);
  }

  async sendStatusChangeNotification(
    deviceName,
    issue,
    newStatus,
    changerName,
    changerRole // เปลี่ยนจาก changerId เป็น changerRole
  ) {
    const statusEmoji = newStatus === "completed" ? "✅" : "❌";
    const statusThai =
      newStatus === "completed" ? "เสร็จสิ้น" : "ไม่สามารถซ่อมได้";
    const statusColor = newStatus === "completed" ? 0x2ecc71 : 0xe74c3c;

    const embed = {
      title: `${statusEmoji} สถานะงานเปลี่ยนแปลง`,
      color: statusColor,
      fields: [
        {
          name: "📱 อุปกรณ์",
          value: deviceName,
          inline: true,
        },
        {
          name: "🔧 ปัญหา",
          value: issue,
          inline: true,
        },
        {
          name: "📝 สถานะใหม่",
          value: statusThai,
          inline: false,
        },
        {
          name: "👤 ดำเนินการโดย",
          value: `${changerName} (${changerRole})`,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };
    return this.sendToDiscord(embed);
  }

  async sendTaskAssignedNotification(
    deviceName,
    issue,
    assignerName,
    assignerRole,
    technicianName,
    technicianRole
  ) {
    const embed = {
      title: "📋 การมอบหมายงานใหม่",
      color: 0xf1c40f, // สีเหลือง
      fields: [
        {
          name: "📱 อุปกรณ์",
          value: deviceName,
          inline: true,
        },
        {
          name: "🔧 ปัญหา",
          value: issue,
          inline: true,
        },
        {
          name: "👤 มอบหมายโดย",
          value: `${assignerName} (${assignerRole})`,
          inline: false,
        },
        {
          name: "🔨 ผู้รับผิดชอบ",
          value: `${technicianName} (${technicianRole})`,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };
    return this.sendToDiscord(embed);
  }
}

export default new DiscordNotificationService();
