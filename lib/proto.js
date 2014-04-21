var http = require('http')
  , utils = require('./utils');

var app = module.exports = {};
//patch node needed
// environment

var env = process.env.NODE_ENV || 'development';
app.use = function(route, override, fn) {
  var args = Array.prototype.slice.call(arguments);
  console.log(args)
  fn = typeof args[args.length - 1] === "function" ? args.pop() : null;
  override = typeof args[args.length - 1] === "boolean" ? args.pop() : false;  
  route = typeof args[args.length - 1] === "string"  || 
    Object.prototype.toString.call(args[args.length - 1]) === '[object RegExp]' ? args.pop() : '/';

  if(override) return this;
  
  // wrap sub-apps - typeof is fastest
  if ('function' == typeof fn.handle) {
    var server = fn;
    fn.route = route;
    fn = function(req, res, next){
      server.handle(req, res, next);
    };
  }

  // wrap vanilla http.Servers
  if (fn instanceof http.Server) {
    fn = fn.listeners('request')[0];
  }

  // strip trailing slash - http://jsperf.com/slice-regex
  if ('/' == route[route.length - 1]) {
    route = route.slice(0, -1);
  }

  this.stack.push({ route: route, handle: fn });

  return this;
};

/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @api private
 */

app.handle = function(req, res, out) {
  var stack = this.stack
    , fqdn = ~req.url.indexOf('://')
    , index = 0;

  function next(err) {
    var layer, path, status, c;

    // next callback
    layer = stack[index++];

    // all done
    if (!layer || res.headersSent) {
      // delegate to parent
      if (out) return out(err);

      // unhandled error
      if (err) {
        // default to 500
        if (res.statusCode < 400) res.statusCode = 500;

        // respect err.status
        res.statusCode = err.status || err.code || err.statusCode || res.statusCode;

        // production gets a basic error message
        var msg = 'production' == env
          ? http.STATUS_CODES[res.statusCode]
          : err.stack || err.toString();

        // log to stderr in a non-test env
        if ('test' != env) console.error(err.stack || err.toString());
        if (res.headersSent) return req.socket.destroy();
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', Buffer.byteLength(msg));
        if ('HEAD' == req.method) return res.end();
        res.end(msg);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        if ('HEAD' == req.method) return res.end();
        res.end('Cannot ' + req.method + ' ' + decodeURI(req.originalUrl));
      }
      return;
    }

    try {
      path = utils.parseUrl(req).pathname;
      if (undefined == path) path = '/';

      //console.log('replace - ' + )

      var route = typeof layer.route == 'string' ? new RegExp(utils.escape(layer.route)) : layer.route;
      console.log('route - ' + route + 'route.test(path) - ' + route.test(path))
      
      // skip this layer if the route doesn't match.
      if(!route.test(path)) return next(err)

      c = path[layer.route.length];
      if (c && '/' != c && '.' != c) return next(err);

      // Ensure leading slash
      if (!fqdn && '/' != req.url[0]) {
        req.url = '/' + req.url;
      }

      var arity = layer.handle.length;
      if (err) {
        if (arity === 4) {
          layer.handle(err, req, res, next);
        } else {
          next(err);
        }
      } else if (arity < 4) {
        layer.handle(req, res, next);
      } else {
        next();
      }
    } catch (e) {
      next(e);
    }
  }
  next();
};

/**
 * Listen for connections.
 *
 * This method takes the same arguments
 * as node's `http.Server#listen()`.
 *
 * HTTP and HTTPS:
 *
 * If you run your application both as HTTP
 * and HTTPS you may wrap them individually,
 * since your Connect "server" is really just
 * a JavaScript `Function`.
 *
 *      var connect = require('connect')
 *        , http = require('http')
 *        , https = require('https');
 *
 *      var app = connect();
 *
 *      http.createServer(app).listen(80);
 *      https.createServer(options, app).listen(443);
 *
 * @return {http.Server}
 * @api public
 */

app.listen = function(){
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};
