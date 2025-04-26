import axios from 'axios';
import config from '../../config';

const API_URL = `${config.API_URL}/api/notes/`;

// Create new note
const createNote = async (noteData, token) => {
  console.log('noteService - Creating note with data:', noteData);
  
  const configObj = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.post(API_URL, noteData, configObj);
    console.log('noteService - Note created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('noteService - Error creating note:', error.response?.data || error.message);
    throw error;
  }
};

// Get user notes
const getNotes = async (token) => {
  console.log('noteService - Fetching all notes');
  
  const configObj = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.get(API_URL, configObj);
    console.log(`noteService - Fetched ${response.data.length} notes`);
    return response.data;
  } catch (error) {
    console.error('noteService - Error fetching notes:', error.response?.data || error.message);
    throw error;
  }
};

// Get single note
const getNote = async (noteId, token) => {
  console.log('noteService - Fetching note with ID:', noteId);
  
  const configObj = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.get(API_URL + noteId, configObj);
    console.log('noteService - Fetched note:', response.data);
    return response.data;
  } catch (error) {
    console.error('noteService - Error fetching note:', error.response?.data || error.message);
    throw error;
  }
};

// Update note
const updateNote = async (noteId, noteData, token) => {
  console.log('noteService - Updating note with ID:', noteId);
  
  const configObj = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.put(API_URL + noteId, noteData, configObj);
    console.log('noteService - Note updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('noteService - Error updating note:', error.response?.data || error.message);
    throw error;
  }
};

// Delete note
const deleteNote = async (noteId, token) => {
  console.log('noteService - Deleting note with ID:', noteId);
  
  const configObj = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.delete(API_URL + noteId, configObj);
    console.log('noteService - Note deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('noteService - Error deleting note:', error.response?.data || error.message);
    throw error;
  }
};

const noteService = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote
};

export default noteService; 