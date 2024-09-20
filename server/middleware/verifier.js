const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifier = async (req, res, next) => {
    // Check if 'web' query param is present, then proceed
    if (req.query.web) return next();

    const { creator } = req.body;

    try {
        const user = await User.findById(creator); // await the result of findById
        if (user && user.sync) {
            return next(); // Add return here to avoid further execution
        } else {
            return res.status(401).json({
                error: 'This action is disabled by the user. Update from website.\n',
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            error:
                'Authentication token error: ' + error.message + '\n',
        });
    }
};

module.exports = verifier;
