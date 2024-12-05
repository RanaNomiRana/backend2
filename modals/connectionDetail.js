const mongoose = require('mongoose');

const connectionDetailSchema = new mongoose.Schema({
    deviceName: { type: String, required: true },
    casenumber: { type: String, required: true },
    additionalInfo: { type: String },
    investigatorId: { type: String, required: true }
}, { timestamps: true });

const ConnectionDetail = mongoose.model('ConnectionDetail', connectionDetailSchema);

module.exports = ConnectionDetail;
