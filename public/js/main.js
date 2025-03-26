import * as store from "./store.js";

const socket = io("/");

socket.on("connect", () => {
  console.log("successfully connected");
  store.setSocketId(socket.id);
});
