var http = require('http');
var req = http.request({
	method:"POST",
	port: 8080,
	headers: {
		'Content-Type': 'application/json'
	}
});

req.write('[');
var n = 900000;
while (n--){
	req.write ('"foo",');
}
req.write('"bar"]');

req.end();