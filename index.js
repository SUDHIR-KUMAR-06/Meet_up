const express = require("express");
const http = require("http");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

let connectedPeers = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  connectedPeers.push(socket.id);
  //   console.log(connectedPeers);

  socket.on("disconnect", () => {
    // console.log("user disconnected");
    const newConnectedPeers = connectedPeers.filter((peerSocketId) => {
      peerSocketId !== socket.id;
    });
    connectedPeers = newConnectedPeers;
    // console.log(connectedPeers);
  });
});

server.listen(PORT, () => {
  console.log(`server is up and running on ${PORT} `);
});
