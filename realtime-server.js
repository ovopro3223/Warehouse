const http = require('http');
const { Server } = require('socket.io');

const port = process.env.REALTIME_PORT || 4000;
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Realtime client connected', socket.id);

  socket.on('sync:update', (payload) => {
    // broadcast to other clients
    socket.broadcast.emit('sync:remote-update', { ...payload, origin: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('Realtime client disconnected', socket.id);
  });
});

server.listen(port, () => console.log(`Realtime server listening on ${port}`));
