const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  tags: {
    type: [String],
    default: []
  },
  images: {
    type: [String], // URLs to stored images
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema); 