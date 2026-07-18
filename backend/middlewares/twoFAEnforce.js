const twoFAEnforce = (req, res, next) => {
    if (req.user.isTwoFAEnabled && !req.tokenPayload.isTwoFAVerified) {
        return res.status(403).json({ message: '2FA verification required' });
    }
    next();
};

module.exports = twoFAEnforce;