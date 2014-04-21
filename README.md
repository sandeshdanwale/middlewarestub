MiddlewareStub
==============

Just a stub

var middlewarestub = require('./middlewarestub');

var app = middlewarestub.createServer();

app.use(function (req, res, next) {
  console.log('request received');
  next();
});

app.use(/^(\/h)/, function (req, res, next) {
	console.log('middleware 1')
	next();
});

app.use(/^(\/h)/, true, function (req, res, next) {
	console.log('middleware 2')
	next();
});

app.use(/^(\/h)/, false, function (req, res, next) {
	console.log('middleware 4')
	next();
});

app.use('/hello', function (req, res) {
	console.log('middleware 5')
	res.end('Hello2!');
});


app.use('/goodbye', function (req, res) {
  res.end('Goodbye!');
});


app.listen(4000);
