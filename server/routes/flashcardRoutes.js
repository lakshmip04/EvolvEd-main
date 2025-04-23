const express = require('express');
const router = express.Router();
const {
  getDecks,
  createDeck,
  getDeck,
  updateDeck,
  deleteDeck,
  addCard,
  updateCard,
  deleteCard
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

// Deck routes
router.route('/')
  .get(protect, getDecks)
  .post(protect, createDeck);

router.route('/:id')
  .get(protect, getDeck)
  .put(protect, updateDeck)
  .delete(protect, deleteDeck);

// Card routes
router.route('/:id/cards')
  .post(protect, addCard);

router.route('/:id/cards/:cardId')
  .put(protect, updateCard)
  .delete(protect, deleteCard);

module.exports = router;