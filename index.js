const express = require("express");
const http = require("http");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
let connectedPeers = [];
let connectedPeersStrangers = [];

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  connectedPeers.push(socket.id);

  socket.on("pre-offer", (data) => {
    const { calleePersonalCode, callType } = data;
    const index = connectedPeers.findIndex(
      (peer) => peer === calleePersonalCode
    );
    if (index >= 0) {
      const data = {
        callType,
        callerSocketId: socket.id,
      };
      io.to(calleePersonalCode).emit("pre-offer", data);
    } else {
      io.to(socket.id).emit("pre-offer-answer", {
        ...data,
        preOfferAnswer: "CALLEE_NOT_FOUND",
      });
    }
  });

  socket.on("pre-offer-answer", (data) => {
    const { callerSocketId } = data;
    const connectedPeer = connectedPeers.find(
      (peer) => peer === callerSocketId
    );
    if (connectedPeer) {
      io.to(callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("user-hanged-up", (data) => {
    const connectedPeer = connectedPeers.find((peer) => peer === data.socketId);
    if (connectedPeer) {
      io.to(connectedPeer).emit("user-hanged-up");
    }
  });

  socket.on("stranger-connection-status", (data) => {
    const { status } = data;
    if (status) {
      connectedPeersStrangers.push(socket.id);
    } else {
      connectedPeersStrangers = connectedPeersStrangers.filter(
        (peer) => peer !== socket.id
      );
    }
  });

  socket.on("webRTC-signaling", (data) => {
    const { socketId } = data;
    const connectedPeer = connectedPeers.find((peer) => socketId === peer);

    if (connectedPeer) {
      io.to(socketId).emit("webRTC-signaling", data);
    }
  });

  socket.on("get-stranger-socket-id", () => {
    let randomStrangerSocketId = null;
    const filteredPeerList = connectedPeersStrangers.filter(
      (stranger) => stranger !== socket.id
    );
    if (filteredPeerList.length > 0) {
      const index = Math.floor(Math.random() * filteredPeerList.length);
      randomStrangerSocketId = filteredPeerList[index];
    }

    const data = { randomStrangerSocketId };
    io.to(socket.id).emit("stranger-socket-id", data);
  });

  socket.on("disconnect", () => {
    connectedPeers = connectedPeers.filter((peer) => peer !== socket.id);
    connectedPeersStrangers = connectedPeersStrangers.filter(
      (peer) => peer !== socket.id
    );
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
