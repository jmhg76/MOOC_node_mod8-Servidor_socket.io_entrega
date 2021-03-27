var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");
var port = process.env.PORT || 3000;


/*

	1.

	Contador de participantes: El cliente web recibe los mensajes new_member y member_exit 
	cuando un participante se conecta/desconecta y muestra el nº de participantes actualizado 
	en el chat. Ahora mismo siempre muestra 0 porque el servidor no le está informando de 
	cuantos participantes hay. 
	
	El alumno debe modificar el fichero index.js para incluir la información necesaria en los
	mensajes de new_member y member_exit. El alumno debe crear una variable global en la que
	se almacene el nº de participantes en cada momento, incrementándo esta cuenta o decrementándola 
	cada vez que un cliente se conecte/desconecte.

	2. 

	Confetti: En la interfaz web hay un botón con un icono de confetti que emite un mensaje del tipo 
	confetti_thrown. Sin embargo, la animación de confetti no se desencadena hasta que el servidor 
	web le envía al cliente el evento confetti_received. El alumno debe modificar el fichero index.js 
	para que cada vez que el servidor reciba un mensaje del tipo confetti_thrown, éste envíe un mensaje 
	confetti_received a todos los participantes, incluyendo en el contenido del mensaje las variables 
	user y from tal y como se indica en la tabla anterior, similar a cómo se lleva a cabo en el mensaje
	new_member.

*/
let counter; // 1. El alumno debe crear una variable global en la que se almacene el nº de participantes

app.use(express.static(path.join(__dirname, "public")));

app.get("*", function(req, res, next) {
    res.redirect("/");
});


io.on('connection', function(socket) {
    const user = socket.handshake.query.name;
    const from = socket.id;

    counter++; // 1. Se contabiliza la unión de un nuevo participante ...
    // 1. ... se conectó un participante, el servidor envío el aviso de la nueva conexion a todos los participantes
    io.emit('new_member', { counter, from, user });

    // Un participante envío un mensaje, el servidor reenvía el mensaje a todos los participantes
    socket.on('chat_message_sent', function(msg) {
        io.emit('chat_message_received', {...msg, user, from });
        console.log(`Mensaje ${msg.content} enviado por ${user}, from: ${from} a todos los participantes`);
    });

    // Un participante de desconectó, el servidor envío la desconexión a todos los participantes
    socket.on('disconnect', function(msg) {
        counter--; // 1. Se despidió un nuevo participante 
        io.emit('member_exit', { counter, from, user });
        console.log(`Participantes actuales ${counter}`);
    });

    // 2. El servidor recibe 'confetti_thrown' de un participante que envío confeti ...
    socket.on('confetti_thrown', function(msg) {
        console.log(`Confeti enviado por user: ${user}, from: ${from} a todos los participantes`);
        io.emit('confetti_received', { from, user }); // ... el servidor envía el confeti al resto de participantes
    });
    console.log(`Participantes actuales ${counter}`);
});

http.listen(port, function() {
    console.log('Open your browser on http://localhost:' + port);
    counter = 0;
});