const AuditLog = require('../models/AuditLog');

const logAction = async (action, performedBy, details = {}) => {
    try {
        await AuditLog.create({ action, performedBy, details });
    } catch (error) {
        console.error('Audit log error:', error);
    }
};

module.exports = logAction;