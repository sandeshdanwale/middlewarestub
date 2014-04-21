var merge = require('merge-descriptors')
  ,parse = require('url').parse;

exports.merge = merge;

exports.parseUrl = function(req){
  var parsed = req._parsedUrl; //cache
  if (parsed && parsed.href == req.url) {
    return parsed;
  } else {
    return req._parsedUrl = parse(req.url);
  }
};

exports.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
