var path              = require('path');

var DataSchemaModel   = require(path.join(__dirname, '..', 'models', 'dataSchemaModel')).DataSchemaModel;
var DeviceSchemaModel = require(path.join(__dirname, '..', 'models', 'deviceSchemaModel')).DeviceSchemaModel;
var logger            = require(path.join(__dirname, '..', 'logger.js'));

exports.post = function(req, res) {

	var newEntry = new DataSchemaModel(req.body);
	newEntry.validate(function(err) {
		if (err) {
			logger.error(err);
			return res.status(400).send();
		} else {
			DeviceSchemaModel.findOne({ did: newEntry.did }, function(err, device) {

				if (err) {
					logger.error(err);
					return res.status(500).send();
				} else {

					if (device) {
							// Save object if the hash is OK
							newEntry.save(function(err) {
								if (err) {
									logger.error(err);
									return res.status(500).send();
								}

								return res.status(200).send('SAVED');
							});
					} else {
						logger.warn('Wrong device identifier.', req);
						res.status(401).send();
					}
				}
			});
		}
	});
};

exports.get = function(req, res) {

  var from = new Date(req.query.from);
  var to = new Date(req.query.to);
  var did = req.query.did;

  // Do we need somekind of validation here?
  DataSchemaModel.find({ 'did': did, 'time': {"$gte": from, "$lte": to }}, function(err, data) {
    if (err) {
      logger.error(err);
      res.status(500).send();

    } else {
      res.json(data);
    }
  }).select('-_id -__v -did').sort({'time': 1}).limit(1000);
};
