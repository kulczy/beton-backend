const server = require('./app');

const PORT = process.env.PORT || 8080;

// Start server
server.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
