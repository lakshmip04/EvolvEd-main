const asyncHandler = require('express-async-handler');
const Flashcard = require('../models/flashcardModel');

// @desc    Get all flashcard decks for a user
// @route   GET /api/flashcards
// @access  Private
const getDecks = asyncHandler(async (req, res) => {
  const decks = await Flashcard.find({ user: req.user.id });
  res.status(200).json(decks);
});

// @desc    Create a new flashcard deck
// @route   POST /api/flashcards
// @access  Private
const createDeck = asyncHandler(async (req, res) => {
  const { deckName, description, cards } = req.body;

  if (!deckName) {
    res.status(400);
    throw new Error('Please add a deck name');
  }

  const deck = await Flashcard.create({
    deckName,
    description: description || '',
    cards: cards || [],
    user: req.user.id
  });

  res.status(201).json(deck);
});

// @desc    Get a single flashcard deck
// @route   GET /api/flashcards/:id
// @access  Private
const getDeck = asyncHandler(async (req, res) => {
  const deck = await Flashcard.findById(req.params.id);

  if (!deck) {
    res.status(404);
    throw new Error('Deck not found');
  }

  // Make sure logged in user matches the deck owner
  if (deck.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json(deck);
});

// @desc    Update a flashcard deck
// @route   PUT /api/flashcards/:id
// @access  Private
const updateDeck = asyncHandler(async (req, res) => {
  const deck = await Flashcard.findById(req.params.id);

  if (!deck) {
    res.status(404);
    throw new Error('Deck not found');
  }

  // Make sure logged in user matches the deck owner
  if (deck.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedDeck = await Flashcard.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedDeck);
});

// @desc    Delete a flashcard deck
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteDeck = asyncHandler(async (req, res) => {
  const deck = await Flashcard.findById(req.params.id);

  if (!deck) {
    res.status(404);
    throw new Error('Deck not found');
  }

  // Make sure logged in user matches the deck owner
  if (deck.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await deck.deleteOne();

  res.status(200).json({ id: req.params.id });
});

// @desc    Add a card to a deck
// @route   POST /api/flashcards/:id/cards
// @access  Private
const addCard = asyncHandler(async (req, res) => {
  const { front, back } = req.body;

  if (!front || !back) {
    res.status(400);
    throw new Error('Please provide front and back content');
  }

  const deck = await Flashcard.findById(req.params.id);

  if (!deck) {
    res.status(404);
    throw new Error('Deck not found');
  }

  // Make sure logged in user matches the deck owner
  if (deck.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  deck.cards.push({
    front,
    back,
    difficulty: 0,
    nextReview: Date.now(),
    reviewCount: 0
  });

  await deck.save();

  res.status(200).json(deck);
});

// @desc    Update a card in a deck
// @route   PUT /api/flashcards/:id/cards/:cardId
// @access  Private
const updateCard = asyncHandler(async (req, res) => {
  const deck = await Flashcard.findById(req.params.id);

  if (!deck) {
    res.status(404);
    throw new Error('Deck not found');
  }

  // Make sure logged in user matches the deck owner
  if (deck.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Find the card index
  const cardIndex = deck.cards.findIndex(card => card._id.toString() === req.params.cardId);

  if (cardIndex === -1) {
    res.status(404);
    throw new Error('Card not found');
  }

  // Update the card
  deck.cards[cardIndex] = {
    ...deck.cards[cardIndex],
    ...req.body,
    _id: deck.cards[cardIndex]._id // Preserve the ID
  };

  await deck.save();

  res.status(200).json(deck);
});

// @desc    Delete a card from a deck
// @route   DELETE /api/flashcards/:id/cards/:cardId
// @access  Private
const deleteCard = asyncHandler(async (req, res) => {
  const deck = await Flashcard.findById(req.params.id);

  if (!deck) {
    res.status(404);
    throw new Error('Deck not found');
  }

  // Make sure logged in user matches the deck owner
  if (deck.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Find and remove the card
  deck.cards = deck.cards.filter(card => card._id.toString() !== req.params.cardId);

  await deck.save();

  res.status(200).json(deck);
});

module.exports = {
  getDecks,
  createDeck,
  getDeck,
  updateDeck,
  deleteDeck,
  addCard,
  updateCard,
  deleteCard
}; 