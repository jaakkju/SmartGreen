var winston = require('winston');
winston.emitErrs = true;

var timestamp  = process.env.NODE_ENV == 'production' ? false : function() {return '['+ new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + ']'; };

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: timestamp
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};