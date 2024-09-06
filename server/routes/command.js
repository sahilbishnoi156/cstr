const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Command = require("../models/command");
const stringSimilarity = require("string-similarity");
const fetchuser = require("../middleware/fetcher");

router.post(
  "/createCommand",
  [body("creator", "Enter a valid creator").isLength({ min: 3 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success: false });
      }

      const { creator, description, command } = req.body;
      const newCommand = new Command({
        description,
        command,
        creator,
      });

      await newCommand.save();
      res.status(200).json({ data: newCommand, success: true });
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong");
    }
  }
);

router.post(
  "/createCommands",
  fetchuser,
  [
    body("commands").isArray().withMessage("Commands must be an array\n"),
    body("commands.*.label", "Enter a valid command\n").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errors_arr = errors.array();
        const error = errors_arr.reduce((a, b) => {
          return a + " " + b.msg;
        }, "");
        return res.status(400).send(error + "\n");
      }

      const { commands, creator } = req.body; // Extract creator and commands

      // Validate that the creator is provided and commands are in the correct format
      if (!creator || !Array.isArray(commands)) {
        return res.status(400).send("Invalid request format\n");
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

      res.status(200).send("Data saved successfully\n");
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong\n");
    }
  }
);

router.get("/getcommands", fetchuser, async (req, res) => {
  const { creator } = req.body;
  try {
    const commands = await Command.find({ creator });
    const newCommands = commands.map((command) => {
      const readable_date = new Date(command.created_at).toLocaleDateString();
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
      };
    });
    res.status(200).json({ data: newCommands });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message + "\n" });
  }
});

router.get("/searchcommands", async (req, res) => {
  const { searchString } = req.query;

  if (!searchString) {
    return res
      .status(400)
      .json({ success: false, message: "Search string is required" });
  }

  try {
    // First, try to find exact or near-exact matches with regex
    const searchPattern = new RegExp(searchString.split(" ").join(".*"), "i");
    let commands = await Command.find({ command: { $regex: searchPattern } });

    if (commands.length === 0) {
      // If no commands found, fetch a limited set of commands for fuzzy searching
      const initialPattern = new RegExp(`^${searchString.split(" ")[0]}`, "i"); // Fetch based on the first word or prefix
      const potentialCommands = await Command.find({
        command: { $regex: initialPattern },
      }).limit(50);

      // Perform string similarity search on this limited set
      const commandStrings = potentialCommands.map((cmd) => cmd.command);
      const matches = stringSimilarity.findBestMatch(
        searchString,
        commandStrings
      );
      const bestMatches = matches.ratings
        .filter((match) => match.rating > 0.3)
        .map((match) => match.target);

      // Retrieve full command data for best matches
      commands = await Command.find({ command: { $in: bestMatches } });
    }

    res.status(200).json({ data: commands, success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occurred");
  }
});

module.exports = router;
