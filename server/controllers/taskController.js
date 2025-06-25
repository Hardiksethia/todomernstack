const Task = require('../models/Task');

// @desc Create new task
exports.createTask = async (req, res) => {
  const { title, description, dueDate, priority, status, category } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ message: 'Title and due date are required' });
  }

  try {
    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
      priority,
      status,
      category,
      activityLog: [
        {
          action: 'created',
          timestamp: new Date(),
          user: req.user._id,
          details: {
            title,
            description,
            dueDate,
            priority,
            status,
            category
          }
        }
      ]
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all tasks for logged-in user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, dueDate, priority, status, category } = req.body;
    const changes = [];
    if (title && title !== task.title) {
      changes.push({
        action: 'title_changed',
        details: { from: task.title, to: title }
      });
      task.title = title;
    }
    if (description && description !== task.description) {
      changes.push({
        action: 'description_changed',
        details: { from: task.description, to: description }
      });
      task.description = description;
    }
    if (dueDate && dueDate !== task.dueDate.toISOString()) {
      changes.push({
        action: 'dueDate_changed',
        details: { from: task.dueDate, to: dueDate }
      });
      task.dueDate = dueDate;
    }
    if (priority && priority !== task.priority) {
      changes.push({
        action: 'priority_changed',
        details: { from: task.priority, to: priority }
      });
      task.priority = priority;
    }
    if (status && status !== task.status) {
      changes.push({
        action: 'status_changed',
        details: { from: task.status, to: status }
      });
      task.status = status;
    }
    if (category && category !== task.category) {
      changes.push({
        action: 'category_changed',
        details: { from: task.category, to: category }
      });
      task.category = category;
    }
    // Add a general update log if there were any changes
    if (changes.length > 0) {
      changes.forEach(change => {
        task.activityLog.push({
          action: change.action,
          timestamp: new Date(),
          user: req.user._id,
          details: change.details
        });
      });
    } else {
      // If no field changed, log a generic update
      task.activityLog.push({
        action: 'updated',
        timestamp: new Date(),
        user: req.user._id,
        details: null
      });
    }
    const updated = await task.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Add activity log entry before deletion
    task.activityLog.push({
      action: 'deleted',
      timestamp: new Date(),
      user: req.user._id,
      details: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        category: task.category
      }
    });
    await task.save();

    await Task.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Get today's tasks
exports.getTodayTasks = async (req, res) => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  try {
    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: start, $lte: end }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Get overdue tasks
exports.getOverdueTasks = async (req, res) => {
  const now = new Date();
  try {
    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $lt: now },
      status: { $ne: 'Completed' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get upcoming tasks (after today)
exports.getUpcomingTasks = async (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  try {
    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: tomorrow }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc Get tasks by specific date (for calendar)
exports.getTasksByDate = async (req, res) => {
  const { date } = req.params;
  if (!date) return res.status(400).json({ message: 'Date is required' });

  const target = new Date(date);
  const start = new Date(target.setHours(0, 0, 0, 0));
  const end = new Date(target.setHours(23, 59, 59, 999));

  try {
    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: start, $lte: end }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc Get all categories used by the user
exports.getUserCategories = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    const categories = [...new Set(tasks.map(task => task.category || 'General'))];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get tasks by category
exports.getTasksByCategory = async (req, res) => {
  const { category } = req.params;
  if (!category) return res.status(400).json({ message: 'Category is required' });

  try {
    const tasks = await Task.find({
      user: req.user._id,
      category: category
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Get all dates that have tasks
exports.getDatesWithTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });

    const dateMap = {};

    tasks.forEach(task => {
      const dateKey = task.dueDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (dateMap[dateKey]) {
        dateMap[dateKey]++;
      } else {
        dateMap[dateKey] = 1;
      }
    });

    const result = Object.entries(dateMap).map(([date, count]) => ({
      date,
      count
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc Get dashboard summary
exports.getTaskSummary = async (req, res) => {
  try {
    const allTasks = await Task.find({ user: req.user._id });

    const now = new Date();
    const summary = {
      totalTasks: allTasks.length,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      overdue: 0
    };

    allTasks.forEach(task => {
      if (task.status === 'Completed') summary.completed++;
      if (task.status === 'In Progress') summary.inProgress++;
      if (task.status === 'Not Started') summary.notStarted++;

      // Overdue = due date before today & not completed
      if (task.dueDate < now && task.status !== 'Completed') summary.overdue++;
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.searchTasks = async (req, res) => {
  const { query } = req.query;

  try {
    const tasks = await Task.find({
      user: req.user._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

