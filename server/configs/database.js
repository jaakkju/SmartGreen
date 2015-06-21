var mongoose = require('mongoose');
var logger   = require('../logger.js');
var options  = {};

var mongolab = '';
var localhost = '';
var address  = process.env.NODE_ENV != 'production' ? localhost : mongolab;

mongoose.connect(address, options, function (err, res) {
    if (err) {
        logger.error('[DB] Connection failed to ' + address + '. ' + err);
    } else {
        logger.info('[DB] Successfully connected to: ' + address);
    }
});