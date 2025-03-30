const safeGet = (key) => {
  return window.privateContent?.[key] || "[hidden]";
};

export const content = {
  whoami: "I'm Ali Sevindik — software engineer blending embedded systems with full-stack cloud tools.",

  help: `Available commands: help, whoami, projects, contacts, clear`,

  projects: [
    "Here are some of my highlighted projects:",
    "- MotionAI: Real-time localization using GNSS/IMU and OpenStreetMap.",
    "- Radar AI: Machine learning–driven radar data preprocessing for ADAS.",
    "- FleetView: Real-time vehicle dashboard using InfluxDB + React.",
    "- Lely Robotics: Diagnostic and control software for autonomous robots."
  ],

  contacts: [
    "Feel free to reach out or explore more!",
    `Email: ${safeGet("email")}`,
    `LinkedIn: ${safeGet("linkedin")}`,
    `GitHub: ${safeGet("github")}`,
    `Website: ${safeGet("website")}`
  ]
};
