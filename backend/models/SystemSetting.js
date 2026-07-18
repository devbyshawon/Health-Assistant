const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema({
    voiceInputEnabled: {type: Boolean, default: true},
    aiChatLogsEnabled: {type: Boolean, default: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemSetting', SystemSettingSchema);