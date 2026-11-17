import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

const OWNER_NAME = "Cihad Ahmed Üzümcü";

const COURSES = [
  { id: 1, title: "Introduction to Programming", credits: 6 },
  { id: 2, title: "Web Programming", credits: 5 },
  { id: 3, title: "Database Management Systems", credits: 5 },
  { id: 4, title: "Operating Systems", credits: 6 },
];

const ROBOTS_TXT = ["User-agent: *", "Disallow: /api/", "Allow: /"].join("\n");

let requestsServed = 0;

function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
}

function requestCounter(req, res, next) {
  requestsServed += 1;
  next();
}

app.use(requestLogger);
app.use(requestCounter);

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

app.get("/api/headers", (req, res) => {
  res.json({
    userAgent: req.get("User-Agent") ?? null,
    accept: req.get("Accept") ?? null,
  });
});

app.post("/api/subscribe", (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get("/api/admin", (req, res) => {
  res.status(403).json({ error: "Forbidden" });
});

app.get("/api/stats", (req, res) => {
  res.json({ requestsServed });
});

app.use((req, res) => {
  const isApiRequest = req.path === "/api" || req.path.startsWith("/api/");
  if (isApiRequest) {
    res.status(404).json({ error: "Not found" });
  } else {
    res.status(404).type("text/plain").send(`Page not found: ${req.path}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
