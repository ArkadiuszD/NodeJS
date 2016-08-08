var connect = require('connect');
connect()
	.use(logger)
	.use('/admin', restrict)
	.use('/admin', admin)
	.use(hello)
	.listen(8080);


	function logger(req,res,next) {
	console.log('%s , %s', req.method, req.url);
	next();
}

	function hello(req,res) {
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World');
}

function restrict(req,res,next) {
	var autorization = req.headers.autorization;
	if (!autorization) return next( new Error ('Użytkownik nieupoważniony'));
	var parts = autorization.split(' ')
	var scheme = parts[0]
	var autch = new Buffer(parts[1],'base64').toString().split(':')
	var user = autch[0]
	var pass = autch[1];
	authenticationWithDatabase(user,pass, function(err){
		if(err) return next(err);
		next();
	});
}

function admin(req,res,next) {
	switch(req.url){
		case '/':
			res.end('/users');
			break;
		case '/users':
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(['tobi', 'łukasz', joanna]));
			break;
	}
}

function setup(format) {
	var regexp - /:(\w+)/g;
	return function logger (req,res,next){
		var str = format.replace(regexp, function(match, property){
			return req[property];
		});
		console.log(str);
		next();
	}
}
module.exports = setup;