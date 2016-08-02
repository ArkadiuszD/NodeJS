var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache ={};

function send404(response){
	console.log("send404");
response.writeHead(404, {'Content-Type': 'text/plain'});
response.write('Błąd 404 - plik nie został znaleziony');
response.end();
}

function sendFile(response, filePath, fileContents){
	console.log("sendFile");
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}

function serveStatic( response, cache, absPath){
	console.log("serveStatic");
	if(cache[absPath]){
		sendFile(response,absPath,cache[absPath]);
} else {
	fs.exists(absPath, function(exists){
		if(exists){
			fs.readFile(absPath,function(err, data){
				if(err){
					send404(response);
				} else {
					cache[absPath]=data;
					sendFile(response, absPath, data);
				}
			});
		} else{
			send404(response);
		}
	});
}
}

var server = http.createServer(function(request,response){
	var filePath=false;
	console.log("createServer");
	if(request.url== '/') {
		filePath= 'public/index.html';
	} else {
		filePath= 'public' + filePath;
		serveStatic(response,cache,absPath);
	}
});

server.listen(8080, function(){
	console.log("Server jest na porcie 8080.");
});

var chatServer = require('./lib/chat_server');
console.log("chatServer");
chatServer.listen(server);

