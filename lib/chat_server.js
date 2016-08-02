var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom= {};

exports.listen= function(server){
	console.log("exports.listen");
	io=socketio.listen(server);
	io.set('log lever',1);

	io.sockets.on('connection', function(socket){
		guestNumber = assignGuestName(socket.guestNumber,nickNames, namesUsed);
		joinRoom(socket, 'Lobby');

		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket,nickNames,namesUsed);
		handleRoomJoining(socket);

		socket.on('rooms',function(){
			socket.emit('rooms', io.sockets.manager.rooms);
		});
		handleClientDisconnection(socket, nickNames,namesUsed)
	});
}

function assignGuestName(socket,guestNumber,nickNames,namesUsed){
	console.log("assignGuestName");
	var name ='Gosc' + guestNumber;
	nickNames[socket.id]=name;
	socket.emit('nameResult',{
		success: true,
		name: name
	});
	namesUsed.push(name);
	return guestNumber+1;
}

function joinRoom(socket,room){
	console.log("joinRoom");
	socket.join(room);
	currentRoom[socket.id]=room;
	socket.emit('joinResult', {room: room});
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id]+' dolaczyl do pokoju'+ room +'.'
	});
	var usersInRoom = io.sockets.clients(room);
	if (usersInRoom.length>1){
		var usersInRoomSummary = 'lista uzytkownikow w pokoju' + room +'.';
		for (var index in usersInRoom) {
			var userSocketId = usersInRoom[index].id;
			if(userSocketId != socket.id){
				if (index>0){
					usersInRoomSummary+= '.';
				}
				usersInRoomSummary+=nickNames[userSocketId];
			}
			usersInRoomSummary+='.';
			socket.emit('message',{text: usersInRoomSummary});
		}
	}

}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	console.log("handleNameChangeAttempts");
		socket.on('nameAttempt', function(name){
			if(name.indexOf('Gosc')==0){
				socket.emit('nameResult',{
					success: false,
					message: "nazwa nie moze zaczynac sie od gosc"
				});
			} else {
				if (namesUsed.indexOf(name)== -1){
					var previousName = nickNames[socket.id];
					var previousNameIndex = namesUsed.indexOf(previousName);
					namesUsed.push(name);
					nickNames[socket.id] = name;
					delete namesUsed[previousNameIndex];
					socket.emit('nameResult', {
						success:true,
						name: name
					});
					socket.broadcast.to(currentRoom[socket.id]).emit('message',{
						text: previousName+'zmienil nazwe na '+ name +'.'
					});
				} else {
					socket.emit('nameResult', {
						success: false,
						message: "ta nazwa uzytkownika jest juz zajeta"
					});
				} 
			}
		});
}

function handleMessageBroadcasting(socket){
	console.log("handleMessageBroadcasting");
	socket.on('message', function (message){
		socket.broadcast.to(message.room).emit('message',{
			text: nickNames[socket.id]+': '+ message.text
		});
	});
}

function handleRoomJoining(socket){
	console.log("handleRoomJoining");
	socket.on('join', function(room){
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}

function handleClientDisconnection(socket){
	console.log("handleClientDisconnection");
	socket.on("disconnect", function(){
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex];
		delete nickNames[socket.id];
	})
}