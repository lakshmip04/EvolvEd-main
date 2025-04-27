const asyncHandler = require('express-async-handler');
const Task = require('../models/taskModel');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.status(200).json(tasks);
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority, status, tags } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please add a title');
  }

  const task = await Task.create({
    title,
    description,
    dueDate,
    priority,
    status,
    tags,
    user: req.user.id,
  });

  res.status(201).json(task);
});

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Make sure logged in user matches the task owner
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json(task);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await task.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask
}; 