var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    did: { type: String, required: true, unique: true }
});

// Export Models
exports.DeviceSchemaModel = mongoose.model('DeviceSchema', DeviceSchema);