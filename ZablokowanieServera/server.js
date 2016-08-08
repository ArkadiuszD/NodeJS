var connect = require('connect');
var bodyParser = require('body-parser');

var app = connect()
	.use(bodyParser.urlencoded({ extended: true }));

	app.listen(8080);