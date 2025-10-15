const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 🔧 Vote persistence setup
const voteFile = path.join(__dirname, 'private_votes.json');

function saveVote(vote) {
  let votes = [];
  if (fs.existsSync(voteFile)) {
    votes = JSON.parse(fs.readFileSync(voteFile));
  }
  votes.push(vote);
  fs.writeFileSync(voteFile, JSON.stringify(votes, null, 2));
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serves your HTML

// POST /register — handles vote submission
app.post('/register', (req, res) => {
  const { username, password, agree } = req.body;

  if (!username || !password || agree !== 'on') {
    return res.status(400).send('❌ All fields required and privacy policy must be accepted.');
  }

  const vote = {
    username,
    password,
    timestamp: new Date().toISOString()
  };

  saveVote(vote); // ✅ Use the persistent save function

  res.send('✅ Your vote has been registered. Thank you!');
});

// ✅ GET /admin/votes — secure route to view votes
app.get('/admin/votes', (req, res) => {
  // 🔐 Protect with secret code
  if (req.query.secret !== 'musi') {
    return res.status(403).send('Access denied');
  }

  if (fs.existsSync(voteFile)) {
    const raw = fs.readFileSync(voteFile);
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } else {
    res.status(404).send('No votes found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
