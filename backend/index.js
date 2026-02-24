// Entry point for backend

const express = require('express');
const app = express();

// ...existing code...

module.exports = app;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
