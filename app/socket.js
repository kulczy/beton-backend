const jwt = require('./utils/jwt');

module.exports = (io, app) => {
  // Create socket namespaces
  const ioMember = io.of('/socket_member');
  const ioTeam = io.of('/socket_team');

  // Socket middleware - verify token before connect
  // throw error if token is invalid
  io.use((socket, next) => {
    try {
      const tokenData = jwt.verifyToken(socket.handshake.query.token);
      socket.request.tokenData = tokenData;
      return next();
    } catch (err) {
      return next(new Error('authentication error'));
    }
  });

  // Connect to room
  ioMember.on('connection', (socket) => {
    socket.join(`ioMember_${socket.request.tokenData._id_user}`);
  });

  // Connect to room
  ioTeam.on('connection', (socket) => {
    socket.join(`ioTeam_${socket.handshake.query.teamid}`);
  });

  // Add socket namespaces to express middleware
  app.use((req, res, next) => {
    req.ioMember = ioMember;
    req.ioTeam = ioTeam;
    next();
  });
};
