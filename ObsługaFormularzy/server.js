var http = require('http');
var items = [];

var server= http.createServer(function(req,res){
	if('/'==req.url){
		switch(req.method){
			case 'GET':
			show(res);
			break;
			case 'POST':
			add(req,res);
			break;
			default:
			badRequest(res);
		}
	}else {
		notFound(res);
	}
});

server.listen(8080);

function show(res) {
	var html = '<html><head></head><body>'
	+'<ul>'
	+items.map(function(item){
		return '<li>'+ item+'</li>'
	}).join('')
+'</ul>'
  +'<form method="post" action"/">'
  + ' <input type="text" name="item" />'
 +  ' <input type="submit"value="Dodaj"/>'
 +' </form>'
+'</body>'
+'</html>';

res.setHeader('Content-Type', 'text/html');
res.setHeader('Content-Length', Buffer.byteLength(html));
res.end(html);
}

function badRequest(res) {
	res.statusCode = 400;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Nieprawdłowe żądanie');
}

function notFound(res) {
	res.statusCode=404;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Nie znaleziono zasobów');
}

var qs=require('querystring');
function add(req,res) {
	var body='';
	req.setEncoding('utf8');
	req.on('data', function(chunk){
		body+=chunk
	});
	req.on('end',function(){
		var obj=qs.parse(body);
		items.push(obj.item);
		show(res);
	});
}