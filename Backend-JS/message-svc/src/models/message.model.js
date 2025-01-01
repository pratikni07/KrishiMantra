const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Chat",
    },
    sender: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "video", "text_image", "text_video"],
    },
    mediaUrl: {
      type: String,
    },
    readBy: [
      {
        userId: String,
        readAt: Date,
      },
    ],
    deliveredTo: [
      {
        userId: String,
        deliveredAt: Date,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
module.exports = mongoose.model("Message", messageSchema);
