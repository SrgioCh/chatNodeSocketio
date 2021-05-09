const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const http = require("http");
const path = require("path");


const app = express();
server = http.createServer(app);
const io = socketio.listen(server);


//conectando con la BD
const basedatos ="mongodb+srv://udemy:udemy@nodeudemicluster-hipfa.gcp.mongodb.net/chatDataBase?retryWrites=true&w=majority";
mongoose.connect(basedatos,
    {useNewUrlParser: true,
      useUnifiedTopology: true})
  .then((db) => {
    console.log("Base de datos conectada");
  })
  .catch((error) => console.log(error));

//configuramos un puerto por defecto
app.set("port", process.env.PORT || 3000);
const puerto = app.get("port");

//llamamos al modulo de sockets.js
const codigo_socket = require("./sockets"); 
codigo_socket(io);

//indicamos que arrancaremos el front de index.html
const rutaPublic = path.join(__dirname, "public");
app.use(express.static(rutaPublic));

server.listen(puerto, () => {
  console.log("runing en puerto : " + puerto);
});

