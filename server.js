// server.js
const express = require('express');
const app = express();

// Route kecil agar Replit anggap aktif
app.get('/', (req, res) => {
  res.send('SevenX AI sedang berjalan... ✅');
});

// Jalankan server di port Replit
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server aktif di port ${PORT}`);
});