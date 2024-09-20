const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetcher');

const JWT_SECRET = process.env.JWT_SECRET || '';

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required

router.post(
    '/createuser',
    [
        body('name', 'Name must be atleast 3 characters').isLength({
            min: 3,
        }),
        body('email', 'Enter a valid email').isEmail(),
        body(
            'password',
            'Password must be atleast 8 characters'
        ).isLength({
            min: 8,
        }),
    ],
    async (req, res) => {
        let success = false;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ errors: errors.array(), success });
        }
        try {
            // Check whether the user with this email exists already
            let user = await User.findOne({ email: req.body.email });

            // if user already exists
            if (user) {
                success = false;
                return res.status(400).json({
                    error: 'Email already exists',
                    success,
                });
            }

            // creating hashed password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(
                req.body.password,
                salt
            );

            // Create a new user
            user = await User.create({
                name: req.body.name,
                password: hashedPassword,
                email: req.body.email,
            });

            res.json({ success: true, name: user.name });
        } catch (error) {
            res.status(500).json({ success: false, error });
        }
    }
);
// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post(
    '/login',
    [
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password cannot be blank').exists(),
    ],
    async (req, res) => {
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errors_arr = errors.array();
            const error = errors_arr.reduce((a, b) => {
                return a + ', ' + b.msg;
            }, '');
            return res
                .status(400)
                .json({ error, success: false, errors: errors_arr });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Email not found',
                });
            }

            const passwordCompare = await bcrypt.compare(
                password,
                user.password
            );
            if (!passwordCompare) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid password',
                });
            }

            const data = {
                creator: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            };
            const authtoken = jwt.sign(data, JWT_SECRET);
            res.json({
                success: true,
                authtoken,
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });
        }
    }
);

// ROUTE 3: Get logged in User Details using: POST "/api/auth/getuser". Login required
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        const user = await User.findById(req.body.creator).select(
            '-password'
        );
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/changename', fetchuser, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({
            error: 'Name cannot be empty',
        });
    }
    try {
        // Find the user by email
        const user = await User.findById(req.body.creator);
        user.name = name;
        await user.save();
        res.json({
            data: 'Changed Successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message || 'Internal Server Error',
        });
    }
});
router.post('/resetPass', fetchuser, async (req, res) => {
    const { oldpassword, newpassword } = req.body;
    try {
        // Find the user by email
        const user = await User.findById(req.body.creator);
        if (user) {
            const passwordCompare = await bcrypt.compare(
                oldpassword,
                user.password
            );
            if (!passwordCompare) {
                return res.status(400).json({
                    error: 'Invalid Old Password',
                });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(
                newpassword,
                salt
            );
            user.password = hashedPassword;
            await user.save();
        }
        res.json({
            data: 'Reset Successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message || 'Internal Server Error',
        });
    }
});

router.post('/sync', fetchuser, async (req, res) => {
    const { creator, enableSync } = req.body;
    try {
        if (req.query.status) {
            const user = await User.findById(creator);
            res.status(200).json({ sync: user.sync });
            return;
        }
        const user = await User.findById(creator);
        user.sync = enableSync;
        await user.save();
        res.json({ data: 'Change Applied' });
    } catch (error) {
        res.status(500).json({
            error: error.message || 'Internal Server Error',
        });
    }
});

router.get('/authenticate', async (req, res) => {
    const token = req.query.token;

    // Check if token is missing
    if (!token) {
        return res
            .status(401)
            .send('Error: Please authenticate using a valid token');
    }

    try {
        // Verify the token
        const data = jwt.verify(token, JWT_SECRET);

        // If verification is successful, respond with the data
        res.status(200).json({ data: data });
    } catch (error) {
        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Error: Authentication token has expired',
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Error: Invalid authentication token',
            });
        }
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({
                error: 'Error: Authentication token not active yet',
            });
        }

        // For other errors, log them and send a generic message
        console.log(error);
        res.status(500).json({
            error: 'Error: Authentication failed error unknown',
        });
    }
});

module.exports = router;
