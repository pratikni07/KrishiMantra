const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });
module.exports = mongoose.model("Chat", chatSchema);
