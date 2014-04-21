
module.exports = function uncaughtExceptionHandler(logger) {
  process.on('uncaughtException', function (err) {
    console.log('here')
    try {
      if(!logger)
        console.error('internal server error', {
          error: (err.stack || err)
        });
      else
        logger.error('internal server error', {
          error: (err.stack || err)
        });
    } catch (e) {
      console.error('[InternalError] Cause: ' +
      (e.stack ? e.stack : e));
    }
  });

  return function (req, res, next) {
    next();
  };
};

