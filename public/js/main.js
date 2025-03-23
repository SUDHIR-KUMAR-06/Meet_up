const socket = io("/");

socket.on("connect", () => {
  console.log("successfully connected");
  console.log(socket.id);
});
