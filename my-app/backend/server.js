// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Initialize SQLite database
const db = new sqlite3.Database('./stark_internship.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create applications table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      areaOfInterest TEXT NOT NULL,
      sop TEXT NOT NULL,
      date TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        console.log('Applications table ready.');
      }
    });
  }
});

// API Routes
// Get all applications
app.get('/api/applications', (req, res) => {
  db.all(`SELECT * FROM applications`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get applications by area of interest
app.get('/api/applications/:area', (req, res) => {
  const area = req.params.area;
  
  db.all(`SELECT * FROM applications WHERE areaOfInterest = ?`, [area], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Submit a new application
app.post('/api/applications', (req, res) => {
  const { fullName, email, areaOfInterest, sop } = req.body;
  
  // Basic validation
  if (!fullName || !email || !areaOfInterest || !sop) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Get current date formatted
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Insert application into database
  db.run(
    `INSERT INTO applications (fullName, email, areaOfInterest, sop, date) VALUES (?, ?, ?, ?, ?)`,
    [fullName, email, areaOfInterest, sop, today],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        id: this.lastID,
        fullName,
        email,
        areaOfInterest,
        sop,
        date: today,
        message: `Thank you, ${fullName}, for applying to the ${areaOfInterest} division at Stark Industries!`
      });
    }
  );
});

// Search applications
app.get('/api/search', (req, res) => {
  const searchTerm = req.query.term;
  
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }
  
  db.all(
    `SELECT * FROM applications WHERE 
     fullName LIKE ? OR 
     email LIKE ? OR 
     areaOfInterest LIKE ? OR 
     sop LIKE ?`,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get application stats
app.get('/api/stats', (req, res) => {
  db.all(`SELECT areaOfInterest, COUNT(*) as count FROM applications GROUP BY areaOfInterest`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format the stats
    const stats = {
      total: 0,
      ai: 0,
      robotics: 0,
      cybersecurity: 0,
      energy: 0,
      spaceTech: 0
    };
    
    rows.forEach(row => {
      stats.total += row.count;
      
      switch(row.areaOfInterest) {
        case 'AI':
          stats.ai = row.count;
          break;
        case 'Robotics':
          stats.robotics = row.count;
          break;
        case 'Cybersecurity':
          stats.cybersecurity = row.count;
          break;
        case 'Energy':
          stats.energy = row.count;
          break;
        case 'Space Tech':
          stats.spaceTech = row.count;
          break;
      }
    });
    
    res.json(stats);
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing