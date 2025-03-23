const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/piblic/index.html");
});

server.listen(PORT, () => {
  console.log(`server is up and running on ${PORT} `);
});
