const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files (index.html)
app.use(express.static(__dirname));

let users = [];

// Signup
app.post("/signup", (req, res) => {
  const { username } = req.body;

  if (!username) return res.send("Username required");

  let existing = users.find(u => u.username === username);
  if (existing) return res.send("User already exists");

  users.push({ username, scores: [] });
  res.send("User created");
});

// Add Score
app.post("/add-score", (req, res) => {
  const { username, score, date } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.send("User not found");

  if (score < 1 || score > 45) {
    return res.send("Score must be between 1 and 45");
  }

  if (!date) return res.send("Date required");

  const today = new Date().toISOString().split("T")[0];
  if (date < today) {
    return res.send("Past dates not allowed");
  }

  if (user.scores.find(s => s.date === date)) {
    return res.send("Duplicate date not allowed");
  }

  if (user.scores.length >= 5) {
    user.scores.shift();
  }

  user.scores.push({ score, date });

  res.json(user.scores);
});

// Draw
app.get("/draw", (req, res) => {
  let drawNumbers = [];

  while (drawNumbers.length < 5) {
    let num = Math.floor(Math.random() * 45) + 1;
    if (!drawNumbers.includes(num)) drawNumbers.push(num);
  }

  let winners = [];

  users.forEach(user => {
    let matchCount = 0;

    user.scores.forEach(s => {
      if (drawNumbers.includes(Number(s.score))) {
        matchCount++;
      }
    });

    if (matchCount >= 3) {
      winners.push({
        username: user.username,
        matches: matchCount
      });
    }
  });

  res.json({ drawNumbers, winners });
});

// Admin
app.get("/admin", (req, res) => {
  res.json(users);
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Render port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});