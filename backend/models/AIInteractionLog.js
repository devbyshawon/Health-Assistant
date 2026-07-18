const mongoose = require('mongoose');

const AIInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    input: {type: String, required: true},
    output: {type: String},
    type: {type: String, enum: ['diagnosis', 'chat', 'simplifier', 'prep'], required: true },
    createdAt: {type: Date, default: Date.now}
}, {
    timestamps: true
});

AIInteractionSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('AIInteractionLog', AIInteractionSchema);