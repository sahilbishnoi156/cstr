const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Command = require("../models/command");
const stringSimilarity = require("string-similarity");

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

router.get("/getcommands", async (req, res) => {
  const creator = req.query.creator;
  try {
    const commands = await Command.find({ creator });
    res.status(200).json({ data: commands, success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Something went wrong");
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
