const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Command = require('../models/command');
const fetchuser = require('../middleware/fetcher');
const verifier = require('../middleware/verifier');

router.delete(
    '/deleteCommand',
    fetchuser,
    verifier,
    async (req, res) => {
        try {
            const { creator } = req.body;
            const { id } = req.query;
            await Command.findOneAndDelete({
                creator: creator,
                _id: id,
            });
            res.status(200).json({ data: 'Command Deleted' });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: error.message || 'Internal Server Error',
            });
        }
    }
);
router.post(
    '/createCommand',
    fetchuser,
    verifier,
    async (req, res) => {
        try {
            const { creator, command } = req.body;
            const newCommand = new Command({
                label: command.label,
                description: command.description,
                tags: command.tags,
                execution_count: command.execution_count,
                command_output: command.command_output,
                exit_status: command.exit_status,
                source: command.source,
                aliases: command.aliases,
                creator,
            });

            await newCommand.save();
            res.status(200).json({ data: 'Command Added' });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: error.message || 'Internal Server Error',
            });
        }
    }
);

router.post(
    '/createCommands',
    fetchuser,
    verifier,
    [
        body('commands')
            .isArray()
            .withMessage('Commands must be an array\n'),
        body(
            'commands.*.label',
            'Enter a valid command\n'
        ).notEmpty(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errors_arr = errors.array();
                const error = errors_arr.reduce((a, b) => {
                    return a + ' ' + b.msg;
                }, '');
                return res.status(400).send(error + '\n');
            }

            const { commands, creator } = req.body; // Extract creator and commands

            // Validate that the creator is provided and commands are in the correct format
            if (!creator || !Array.isArray(commands)) {
                return res
                    .status(400)
                    .send('Invalid request format\n');
            }

            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                const newCommand = new Command({
                    label: command.label,
                    description: command.description,
                    tags: command.tags,
                    execution_count: command.execution_count,
                    working_directory: command.working_directory,
                    command_output: command.command_output,
                    exit_status: command.exit_status,
                    source: command.source,
                    aliases: command.aliases,
                    creator,
                });

                await newCommand.save();
            }

            res.status(200).send('Data saved successfully\n');
        } catch (error) {
            console.error(error);
            res.status(500).send('Something went wrong\n');
        }
    }
);

router.get('/getcommands', fetchuser, verifier, async (req, res) => {
    const { creator } = req.body;
    const { limit } = req.query;
    try {
        const commands = await Command.find({ creator }).limit(
            limit ? parseInt(limit) : 0
        );
        const newCommands = commands.map((command) => {
            const readable_date = new Date(
                command.created_at
            ).toLocaleDateString();
            return {
                id: command._id,
                label: command.label,
                description: command.description,
                tags: command.tags,
                execution_count: command.execution_count,
                working_directory: command.working_directory,
                command_output: command.command_output,
                exit_status: command.exit_status,
                source: command.source,
                aliases: command.aliases,
                created_at: readable_date,
                is_globally_avail: true,
            };
        });
        res.status(200).json({ data: newCommands });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message + '\n' });
    }
});

router.post('/getbyfield', fetchuser, verifier, async (req, res) => {
    try {
        const { creator, key, value } = req.body;

        let response_commands = await Command.find(
            {
                creator,
                [key]: { $regex: value, $options: 'i' },
            },
            '-_id -__v'
        );
        console.log(response_commands, key, value);

        // If no exact match is found, search for nearest values using MongoDB's aggregation pipeline
        if (response_commands.length === 0) {
            const pipeline = [
                {
                    $match: { creator },
                },
                {
                    $addFields: {
                        distance: {
                            $abs: { $subtract: [`$${key}`, value] },
                        },
                    },
                },
                {
                    $sort: { distance: 1 },
                },
                {
                    $limit: 10, // return up to 10 nearest matches
                },
            ];
            response_commands = await Command.aggregate(pipeline);
        }

        const commands = response_commands.map((command) => {
            const readable_date =
                new Date(command.created_at).toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }
                ) +
                new Date(command.created_at).toLocaleTimeString(
                    'en-US',
                    {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }
                );
            return {
                label: command.label,
                description: command.description,
                tags: command.tags,
                execution_count: command.execution_count,
                working_directory: command.working_directory,
                command_output: command.command_output,
                exit_status: command.exit_status,
                source: command.source,
                aliases: command.aliases,
                created_at: readable_date,
                is_globally_avail: true,
                created_at: readable_date,
            };
        });
        if (commands.length === 0) {
            return res
                .status(200)
                .json({ data: { message: 'No commands found' } });
        }
        res.status(200).json({ data: commands });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(
            'Internal server error occurred : ' + error.message
        );
    }
});

module.exports = router;
