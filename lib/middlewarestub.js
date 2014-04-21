var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits
  , proto = require('./proto')
  , basename = require('path').basename
  , utils = require('./utils')
  , fs = require('fs');

exports = module.exports = createServer;

exports.proto = proto;

/**
 * Auto-load middleware getters.
 */

exports.middleware = {};

/**
 * Expose utilities.
 */

exports.utils = utils;

/**
 * Create a new connect server.
 *
 * @return {Function}
 * @api public
 */

function createServer() {
  function app(req, res, next){ app.handle(req, res, next); }
  utils.merge(app, proto);
  inherits(app, EventEmitter);
  app.route = '/';
  app.stack = [];
  for (var i = 0; i < arguments.length; ++i) {
    app.use(arguments[i]);
  }
  return app;
};

createServer.createServer = createServer;

/**
 * Auto-load bundled middleware with getters.
 */

fs.readdirSync(__dirname + '/middleware').forEach(function(filename){
  if (!/\.js$/.test(filename)) return;
  var name = basename(filename, '.js');
  function load(){ return require('./middleware/' + name); }
  exports.middleware.__defineGetter__(name, load);
  exports.__defineGetter__(name, load);
});
