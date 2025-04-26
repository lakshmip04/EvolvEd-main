const asyncHandler = require('express-async-handler');
const Note = require('../models/noteModel');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  console.log('Getting notes for user ID:', req.user.id);
  try {
    const notes = await Note.find({ user: req.user.id });
    console.log(`Found ${notes.length} notes for user`);
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500);
    throw new Error('Error retrieving notes: ' + error.message);
  }
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  console.log('Creating note with data:', req.body);
  
  const { title, content, tags, images, pdfFile } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please add title and content');
  }

  try {
    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      images: images || [],
      pdfFile: pdfFile || null,
      user: req.user.id
    });

    console.log('Note created successfully:', note._id);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500);
    throw new Error('Error creating note: ' + error.message);
  }
});

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = asyncHandler(async (req, res) => {
  console.log('Getting note with ID:', req.params.id);
  
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      console.log('Note not found');
      res.status(404);
      throw new Error('Note not found');
    }

    // Make sure logged in user matches the note owner
    if (note.user.toString() !== req.user.id) {
      console.log('User not authorized to access note');
      res.status(401);
      throw new Error('Not authorized');
    }

    console.log('Note found:', note._id);
    res.status(200).json(note);
  } catch (error) {
    console.error('Error getting note:', error);
    if (error.kind === 'ObjectId') {
      res.status(404);
      throw new Error('Note not found');
    }
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  console.log('Updating note with ID:', req.params.id);
  console.log('Update data:', req.body);
  
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      console.log('Note not found');
      res.status(404);
      throw new Error('Note not found');
    }

    // Make sure logged in user matches the note owner
    if (note.user.toString() !== req.user.id) {
      console.log('User not authorized to update note');
      res.status(401);
      throw new Error('Not authorized');
    }

    // Update with the pdfFile field if provided
    if (req.body.pdfFile !== undefined) {
      req.body.pdfFile = req.body.pdfFile || null;
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    console.log('Note updated successfully:', updatedNote._id);
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    if (error.kind === 'ObjectId') {
      res.status(404);
      throw new Error('Note not found');
    }
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  console.log('Deleting note with ID:', req.params.id);
  
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      console.log('Note not found');
      res.status(404);
      throw new Error('Note not found');
    }

    // Make sure logged in user matches the note owner
    if (note.user.toString() !== req.user.id) {
      console.log('User not authorized to delete note');
      res.status(401);
      throw new Error('Not authorized');
    }

    await note.deleteOne();

    console.log('Note deleted successfully');
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting note:', error);
    if (error.kind === 'ObjectId') {
      res.status(404);
      throw new Error('Note not found');
    }
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

module.exports = {
  getNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote
}; 