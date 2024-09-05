const mongoose = require("mongoose");
const { Schema, ObjectId } = mongoose;

const CommandSchema = new Schema({
  label: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  execution_count: { type: Number, default: 0 },
  last_executed_at: { type: Date },
  creator: { type: ObjectId, ref: "user", required: true },
  working_directory: { type: String },
  command_output: { type: String },
  exit_status: { type: Number, default: 0 },
  source: { type: String },
  aliases: [{ type: String }],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.Command || mongoose.model("command", CommandSchema);
