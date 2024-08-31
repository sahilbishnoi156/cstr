const mongoose = require("mongoose");
const { Schema, ObjectId } = mongoose;

const CommandSchema = new Schema(
  {
    command: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    executionCount: { type: Number, default: 0 },
    lastExecutedAt: { type: Date },
    creator: { type: ObjectId, ref: "user", required: true },
    workingDirectory: { type: String },
    commandOutput: { type: String },
    exitStatus: { type: Number, default: 0 },
    source: { type: String },
    aliases: [{ type: String }],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Command || mongoose.model("command", CommandSchema);
