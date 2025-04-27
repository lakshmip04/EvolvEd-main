const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { PDFDocument } = require("pdf-lib");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs").promises;
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const {
  getDecks,
  createDeck,
  getDeck,
  updateDeck,
  deleteDeck,
  addCard,
  updateCard,
  deleteCard,
} = require("../controllers/flashcardController");
const Deck = require("../models/Deck");
const Card = require("../models/Card");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Configure multer for temporary PDF storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Function to extract text from PDF pages
async function extractTextFromPDF(pdfBuffer) {
  try {
    // Load the PDF document
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    const pages = [];
    // Iterate through each page
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item) => item.str);
      const text = textItems.join(" ");

      pages.push({
        pageNumber: i,
        text: text.trim(),
      });
    }

    return pages;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

// Function to generate flashcards using HuggingFace
async function generateFlashcards(text) {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/google/flan-t5-base",
        {
          inputs: `Generate 3-5 flashcards from this text. Each flashcard should be in the format "Q: <question> | A: <answer>". Make the questions test understanding of key concepts:

${text}`,
          parameters: {
            max_length: 512,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format from HuggingFace API");
      }

      // Parse the response into flashcard pairs
      const generatedText = response.data[0]?.generated_text || "";
      console.log({ generatedText });
      const cards = generatedText
        .split("\n")
        .filter((line) => line.includes("|") && line.includes("Q:"))
        .map((line) => {
          // Remove Q: and A: prefixes and trim whitespace
          line = line.replace(/Q:\s*/, "").replace(/A:\s*/, "");
          const [front, back] = line.split("|").map((s) => s.trim());
          return { front, back };
        })
        .filter((card) => card.front && card.back); // Filter out invalid cards

      if (cards.length === 0) {
        throw new Error("No valid flashcards generated");
      }

      return cards;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        // If all retries failed, generate basic flashcards from the text
        return generateBasicFlashcards(text);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

// Fallback function to generate basic flashcards from text
function generateBasicFlashcards(text) {
  // Split text into sentences and create simple Q&A pairs
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  return sentences.slice(0, 3).map((sentence) => ({
    front: `What is the meaning of: "${sentence.trim()}"?`,
    back: sentence.trim(),
  }));
}

// @desc    Get all flashcard decks for a user
// @route   GET /api/flashcards/decks
// @access  Private
router.get("/decks", protect, async (req, res) => {
  try {
    const decks = await Deck.find({ userId: req.user.id })
      .sort("-createdAt")
      .lean();

    // Fetch cards for all decks in a single query
    const cards = await Card.find({
      deckId: { $in: decks.map((deck) => deck._id) },
    }).lean();

    // Group cards by deckId
    const cardsByDeck = cards.reduce((acc, card) => {
      if (!acc[card.deckId]) {
        acc[card.deckId] = [];
      }
      acc[card.deckId].push(card);
      return acc;
    }, {});

    // Attach cards to their respective decks
    const decksWithCards = decks.map((deck) => ({
      ...deck,
      cards: cardsByDeck[deck._id] || [],
    }));

    res.json(decksWithCards);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching flashcard decks",
      error: error.message,
    });
  }
});

// @desc    Get single flashcard deck
// @route   GET /api/flashcards/decks/:id
// @access  Private
router.get("/decks/:id", protect, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!deck) {
      return res.status(404).json({ message: "Deck not found" });
    }

    // Fetch cards for this deck
    const cards = await Card.find({ deckId: deck._id }).lean();
    deck.cards = cards;

    res.json(deck);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching deck", error: error.message });
  }
});

// @desc    Upload PDF and create flashcard deck with metadata
// @route   POST /api/flashcards/with-pdf
// @access  Private
router.post("/with-pdf", protect, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Load PDF for page count
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const numPages = pdfDoc.getPageCount();

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(`flashcards/${fileName}`, req.file.buffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("pdfs").getPublicUrl(`flashcards/${fileName}`);

    // Create deck in database
    const deck = await Deck.create({
      title,
      description,
      userId: req.user.id,
      pdfPath: publicUrl,
      pageCount: numPages,
    });

    // Extract text from PDF and generate flashcards
    const pages = await extractTextFromPDF(req.file.buffer);
    console.log({ pages });

    // Generate and store flashcards for each page
    const allCards = [];
    for (const page of pages) {
      const generatedCards = await generateFlashcards(page.text);
      console.log({ generatedCards });

      // Create cards in database
      const cardPromises = generatedCards.map((card) =>
        Card.create({
          deckId: deck._id,
          front: card.front,
          back: card.back,
          pageNumber: page.pageNumber,
        })
      );

      const pageCards = await Promise.all(cardPromises);
      allCards.push(...pageCards);
    }

    // Return response with necessary data
    res.status(201).json({
      success: true,
      url: publicUrl,
      title: deck.title,
      _id: deck._id,
      deckId: deck._id,
      cards: allCards,
    });
  } catch (error) {
    console.error("Error in PDF upload:", error);
    res.status(500).json({
      message: "Error processing PDF upload",
      error: error.message,
    });
  }
});

// Deck routes
router.route("/").get(protect, getDecks).post(protect, createDeck);

router
  .route("/:id")
  .get(protect, getDeck)
  .put(protect, updateDeck)
  .delete(protect, deleteDeck);

// Card routes
router.route("/:id/cards").post(protect, addCard);

router
  .route("/:id/cards/:cardId")
  .put(protect, updateCard)
  .delete(protect, deleteCard);

module.exports = router;
