$(() => {
  const conex_user = io();

  //obteniendo DOM para login
  const nickname = $("#nickname");
  const formuLogin = $("#form-login");
  const errornick = $("#error");
  //obteniendo los elementos del DOM CHAT COMPLETO
  const form = $("#form-message");
  const chat = $("#chat");
  const cuerpoChat = $("#cuerpoChat");
  const menssage = $("#message");
  const usuarios = $("#usersnames");
  const butEnvio=$("#but-envio");
  //----------------------------------ENVIAREMOS AL SERVIDOR-------------------------------------------------

  /* **************LOGIN *******************/
  //capturando eventos
  formuLogin.submit((e) => {
    e.preventDefault();
    let nick = nickname.val();

   if(!nick){
     alert("Debes introducir un nick")
     return;
   }
    // new user : evento customizado

    /* ************************************************************************
     
                                        SECCION DE CHAT

  ********************************************************************************* */
 
    conex_user.emit("new user", nick, (res_servidor) => {
      if (res_servidor) {
        formuLogin.hide();
         /*  *******Recibe msgs y users de BD y pinta el Chat ***********/
          conex_user.on("viejos mensajes", (msgBD) => {
            console.log(msgBD);
            let html3 = "";
            for (let index = 0; index < msgBD.length; index++) {
              html3 = `<span class="text-secondary">${msgBD[index].nick} :</span><span class="text-secondary ml-2">${msgBD[index].msg}</span><br/>`;
              cuerpoChat.append(html3);
            }
          });
          /*------------------*/
        chat.show();
      } else {
        errornick.html(
          "<small class='text-danger'>Error : ese  nickname existe</small>"
        );
        setTimeout(() => {
          errornick.hide();
        }, 6000);
      }
      nickname.val("");
    });
  });


  
  /* ********************ENVIANDO MENSAJE ****************** */
 
  //desactivando y activando buton envio mensaje del form
  butEnvio.attr("disabled",true);//inicio desactivado
  menssage.keyup((ev)=>{
      //activamos si presionamos una tecla en el input del mensaje
        butEnvio.attr("disabled",false);
        //desactivamos si no contiene nada el input del mensaje
        if (menssage.val().length<1) {
        butEnvio.attr("disabled",true); 
        }
    });

  
  form.submit((e) => {
 /*   EXISTIRA 2 TIPOS DE MENSAJE
 1)oculto o  Privado: se colocara antes->  /w nickUser_aquienEnvio  y nuestro mensaje 
 2)normal: sera cualquier carcater introducido en el input correspondiente
 */


    e.preventDefault();
    let mensaje = menssage.val();

    //ENVIAREMOS EL MENSAJE del user
    conex_user.emit("send message", mensaje, (callback_errorOculto) => {
      cuerpoChat.append(
        `<small class='text-danger'>Error : ${callback_errorOculto}</small><br>`
      );
    });
    menssage.val(""); //limpiando el input
  });




  //----------------------RECIBIREMOS DEL SERVIDOR PARA TODOS y LO PINTAMOS---------------------------------------------------
  /* ****** escuchamos o recibimos usuario con su mensaje  ,ya almacenado en la BD ******** */
  conex_user.on("new message", (data) => {
    let html = `<span class="text-dark">${data.nik} :</span><span class="text-primary ml-2">${data.msg}</span><br/>`;
    cuerpoChat.append(html);
  });

  /*  ********escuchar mensaje privado o oculto ********* */

  conex_user.on("oculto sw", (data) => {
    console.log("mensaje oculto");
    let html2 = `<small class="text-success">${data.nik} :</small><small>${data.msg}</small><br/>`;
    cuerpoChat.append(html2);
  });





  /* ************************************************************************
                               
                                 SECCION DE  USUARIOSSS  CONECTADOS

  ********************************************************************************* */
  conex_user.on("usernames", (datos) => {
    console.log(datos);
    const {data,userConect}=datos
    let html = "";

    data.map((nick) => {
      html += `<p>
           <ion-icon name="person-outline"></ion-icon><small class='text-dark ml-2'>${nick}</small>
            </p>`;
    });
    usuarios.html(html);
  });

  
 
});
