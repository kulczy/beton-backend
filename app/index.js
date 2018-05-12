const app = require('./app');

const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
