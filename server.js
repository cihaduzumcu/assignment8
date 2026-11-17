import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

const OWNER_NAME = "Cihad Ahned Üzümcü";

const COURSES = [
  { id: 1, title: "Introduction to Programming", credits: 6 },
  { id: 2, title: "Web Programming", credits: 5 },
  { id: 3, title: "Database Management Systems", credits: 5 },
  { id: 4, title: "Operating Systems", credits: 6 },
];

const ROBOTS_TXT = ["User-agent: *", "Disallow: /api/", "Allow: /"].join("\n");

app.get("/hello", (req, res) => {
  res.send(`Hello from ${OWNER_NAME}'s server`);
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(ROBOTS_TXT);
});

app.get("/old-page", (req, res) => {
  res.redirect("/hello");
});

app.get("/api/courses", (req, res) => {
  res.json(COURSES);
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
