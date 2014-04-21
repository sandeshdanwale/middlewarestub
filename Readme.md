# middlewarestub

```js
var middlewarestub = require('middlewarestub')
  , http = require('http');

var app = middlewarestub()
  .use(function(req, res){
    res.end('Hello from Connect!\n');
  });

http.createServer(app).listen(3000);
```

## Middleware
