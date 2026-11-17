import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

const OWNER_NAME = "Cihad Ahmed Üzümcü";

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
