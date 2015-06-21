var path              = require('path');
var DeviceSchemaModel = require('../models/deviceSchemaModel').DeviceSchemaModel;
var logger            = require(path.join(__dirname, '..', 'logger.js'));

exports.get = function(req, res) {
  DeviceSchemaModel.find(function(err, data) {
      if (err) {
        logger.error(err);
        res.status(500).send();

      } else {
        res.json(data);
      }
    }).select('-_id -__v');
};

exports.post = function(req, res) {
  var newEntry = new DeviceSchemaModel(req.body);
  newEntry.validate(function(err) {
    if(err) {
      logger.error(err);
      return res.status(400).send();

    } else {
      newEntry.save(function(err) {
        if (err) {
          logger.error(err);
          return res.status(500).send();

        } else {
          return res.status(200).json(newEntry);
        }
      });
    }
  });
};