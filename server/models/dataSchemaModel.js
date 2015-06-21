var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DataSchema = new Schema({
    did: { type: String, required: true },
    tem: { type: Number, required: true },
    hum: { type: Number, required: true },
    hin: { type: Number, required: true },
    time: { type: Date, default: Date.now }
});

// Export Models
exports.DataSchemaModel = mongoose.model('DataSchema', DataSchema);