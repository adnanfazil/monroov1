const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/message.model");

function initializeSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        process.env.JWT_KEY,
        (err, decoded) => {
          if (err) return next(new Error("Authentication error"));
          socket.decoded = decoded;
          next();
        }
      );
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("join", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, message, recipientId } = data;
        const senderId = socket.decoded.userID;

        console.log("Received message:", {
          conversationId,
          message,
          recipientId,
          senderId,
        });

        const newMessage = new Message({
          id: require("crypto").randomUUID(),
          senderID: senderId,
          recipientID: recipientId,
          msg: message,
          msgDate: new Date().getTime(),
          conversationId: conversationId,
        });

        await newMessage.save();
        console.log("Message saved to database:", newMessage);

        io.to(conversationId).emit("newMessage", newMessage);
        console.log("Message emitted to room:", conversationId);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("userTyping", {
        userId: socket.decoded.userID,
        isTyping: data.isTyping,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
}

module.exports = initializeSocketServer;
