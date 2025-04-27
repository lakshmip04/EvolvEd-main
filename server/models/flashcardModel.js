const mongoose = require("mongoose");

const flashcardSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    deckName: {
      type: String,
      required: [true, "Please add a deck name"],
    },
    description: {
      type: String,
      default: "",
    },
    cards: [
      {
        front: {
          type: String,
          required: [true, "Please add front content"],
        },
        back: {
          type: String,
          required: [true, "Please add back content"],
        },
        difficulty: {
          type: Number,
          default: 0, // 0 = new, 1 = easy, 2 = medium, 3 = hard
        },
        nextReview: {
          type: Date,
          default: Date.now,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    lastStudied: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Flashcard", flashcardSchema);
