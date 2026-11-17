import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

const OWNER_NAME = "Cihad Ahmed Üzümcü";

app.get("/hello", (req, res) => {
  res.send(`Hello from ${OWNER_NAME}'s server`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
