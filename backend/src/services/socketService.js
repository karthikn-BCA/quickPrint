let io = null;

function initSocket(serverInstance) {
  const { Server } = require('socket.io');

  io = new Server(serverInstance, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client joins their specific order room for tracking updates
    socket.on('join_order_room', (orderId) => {
      if (orderId && typeof orderId === 'string') {
        const roomName = `order:${orderId.toUpperCase()}`;
        socket.join(roomName);
        socket.emit('room_joined', { room: roomName });
      }
    });

    // Admin joins admin dashboard room for real-time notifications
    socket.on('join_admin_room', (authKey) => {
      // Allow admin sockets
      socket.join('admin_dashboard');
      socket.emit('admin_joined', { message: 'Connected to Admin Live Feed' });
    });

    // Print Agent registers
    socket.on('register_agent', (agentData) => {
      socket.join('print_agents');
      socket.emit('agent_registered', { message: 'Connected to Print Queue Hub' });
      // Broadcast to admin that agent is online
      io.to('admin_dashboard').emit('printer_status_change', {
        online: true,
        lastHeartbeat: new Date(),
        printerName: agentData?.printerName || 'Campus Xerox High-Speed Printer',
        simulationMode: !!agentData?.simulationMode,
      });
    });

    socket.on('disconnect', () => {
      // Disconnect handled gracefully
    });
  });

  return io;
}

function getIO() {
  return io;
}

/**
 * Notifies customer subscribed to their specific order channel.
 */
function notifyOrderUpdated(orderId, updatedOrder) {
  if (!io) return;
  const roomName = `order:${orderId.toUpperCase()}`;
  io.to(roomName).emit('order_status_updated', {
    orderId,
    printingStatus: updatedOrder.printingStatus,
    paymentStatus: updatedOrder.paymentStatus,
    collectionStatus: updatedOrder.collectionStatus,
    updatedAt: new Date(),
    order: updatedOrder,
  });
}

/**
 * Dispatches an event to the admin dashboard.
 */
function notifyAdmin(eventName, payload) {
  if (!io) return;
  io.to('admin_dashboard').emit(eventName, {
    timestamp: new Date(),
    ...payload,
  });
}

/**
 * Dispatches a paid print job directly to connected print agents.
 */
function dispatchJobToAgents(jobPayload) {
  if (!io) return;
  io.to('print_agents').emit('new_print_job', jobPayload);
}

module.exports = {
  initSocket,
  getIO,
  notifyOrderUpdated,
  notifyAdmin,
  dispatchJobToAgents,
};
