const schemaChat = require("./mongo/models/mesage");

const Socket = (io) => {
  //simularemos que esta dentro de una BD
  let usuarios = {};

  io.on("connection", async (socket) => {
    console.log("Sockket Ala escucha , app abierta");

    /****************************HACIENDO LOGIN *********************************** */
    //RECIBIMOS  NICK DEL CLIENTE
    socket.on("new user", async(nick, callback) => {
    
      if (nick in usuarios) {
        callback(false);//el nick ya existe
      } else {
        console.log(`${nick} ah iniciado session`);
        callback(true); //el nick no existe, puede ingresar
        
        /*OBTENEMOS DATOS(mensajes-users Conectados) Y LO ENVIAMOS AL FRONT */
        messagesBD = await schemaChat.find({});
        socket.emit("viejos mensajes", messagesBD);
        
        //almacenamos en la prop nickname , el nick del usuario que inicia sesion
        socket.nickname = nick;
        usuarios[socket.nickname] = socket; //cada usuario tendra la informacion completa del socket

        //ENVIAREMOS EL NICK DEL USUARIOS CONECTADOS A TODOS (io)
        const datos={
          data:Object.keys(usuarios),
          userConect:socket.nickname
        }
        io.sockets.emit("usernames",datos); //envia un arreglo de usuarios
      }
    });

    /**************************RECIBIENDO Y ENVIANDO MENSAJE CHAT ********************************* */
    
    //RECIBIMOS EL MENSAJE DE UN CLIENTE
    socket.on("send message", async (mensaje, callback) => {
         var msg = mensaje.trim(); //elimina los espacios de cadenas

      //A)--------------MENSAJE OCULTO PRIVADO---------------
      if (msg.substr(0, 3) == "/w ") {
        nick_mensaje = msg.substr(3); //cogera las letras apartir del indice 3 en adelante
         indexEspacio = nick_mensaje.indexOf(" ");
       
        if (indexEspacio != -1) {
          nameUser = nick_mensaje.substring(0, indexEspacio); //cogera el nick A QUIEN enviaremos mensaje
          mensajeuser = nick_mensaje.substring(indexEspacio + 1);
          //desde el 0 hasta la posicion del espacio en blanco
        } else {
          nameUser = nick_mensaje;
          mensajeuser = " ";
        }

        if (nameUser in usuarios) {
          if (mensajeuser === " ") {
            //no ha enviado mensaje , porque no encontro espacio en blanco
            callback("please  ingresa message");
          } else {
            usuarios[nameUser].emit("oculto sw", {
              msg: mensajeuser,
              nik: socket.nickname, //QUIEN envia el mensaje
            });
            usuarios[socket.nickname].emit("oculto sw", {
              msg: mensajeuser,
              nik: socket.nickname, //QUIEN envia el mensaje
            });
          }
        } else {
          //por si el usuario no se encuentra en el chat
          callback("Error please enter username validate");
        }
      } else {
        //B)----------MENSAJE NORMAL------------------

        //1.-creamos nuestro modelo ,con el mensaje recibido
        var newMsg = new schemaChat({
          nick: socket.nickname,
          msg: msg,
        });
       await newMsg.save();//guardamos el modelo en la BD

        //2.-Enviamos el mensaje a todos los usuarios
        io.sockets.emit("new message", {
          nik: socket.nickname,
          msg: msg,
        });
      }
    });



    /******************************DESCONEXION DE USUARIO (Un socket) ***************************** */
    socket.on("disconnect", (data) => {
      //si no tiene ese nickname
      if (!socket.nickname) return;    
      //si lo tiene :
      const user=usuarios[socket.nickname].nickname;
      console.log(`${user}  abandona la sesion`);
      delete usuarios[socket.nickname];
      //ENVIAREMOS LOS USUARIOS  QUE AUN ESTAN CONECTADOS
      const datos={
        data:Object.keys(usuarios),
        userConect:socket.nickname
      }
      io.sockets.emit("usernames",datos); //envia un arreglo de usuarios
    });



  });
};

module.exports = Socket;
