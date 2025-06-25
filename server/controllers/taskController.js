const Task = require('../models/Task');
const axios = require('axios');
require('dotenv').config();

// @desc Create new task
exports.createTask = async (req, res) => {
  let { title, description, dueDate, priority, status } = req.body;

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
            status
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

    let { title, description, dueDate, priority, status } = req.body;
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
        status: task.status
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

exports.parseTaskInput = async (req, res) => {
  const { input } = req.body;
  const apiKey = process.env.COHERE_API_KEY;
  if (!input) return res.status(400).json({ message: 'Input is required' });
  try {
    console.log('Smart Add input:', input);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const prompt = `Today is ${todayStr}. Extract the following from the input:\n- title: a short, clear summary (max 5 words)\n- description: a clear summary of the task (never leave blank; if unsure, use the input)\n- dueDate: in YYYY-MM-DD format (must be a future date if possible; resolve relative dates like 'Monday', 'next week', 'tomorrow' using today's date)\n- time: in 24-hour format if present, else empty string\nRespond ONLY with a valid JSON object with keys: title, description, dueDate, time.\n\nExample 1:\nInput: Remind me to call John tomorrow at 3pm\nOutput: {\"title\": \"Call John\", \"description\": \"Remind me to call John tomorrow at 3pm\", \"dueDate\": \"2025-06-26\", \"time\": \"15:00\"}\n\nExample 2:\nInput: Finish the project report by Monday\nOutput: {\"title\": \"Project Report\", \"description\": \"Finish the project report by Monday\", \"dueDate\": \"2025-06-30\", \"time\": \"\"}\n\nExample 3:\nInput: Book dentist appointment next Friday at 10am\nOutput: {\"title\": \"Dentist Appointment\", \"description\": \"Book dentist appointment next Friday at 10am\", \"dueDate\": \"2025-07-04\", \"time\": \"10:00\"}\n\nExample 4:\nInput: Submit tax documents by July 15th\nOutput: {\"title\": \"Tax Documents\", \"description\": \"Submit tax documents by July 15th\", \"dueDate\": \"2025-07-15\", \"time\": \"\"}\n\nExample 5:\nInput: Prepare slides for next Monday\nOutput: {\"title\": \"Prepare Slides\", \"description\": \"Prepare slides for next Monday\", \"dueDate\": \"2025-07-07\", \"time\": \"\"}\n\nExample 6:\nInput: Call mom in two days\nOutput: {\"title\": \"Call Mom\", \"description\": \"Call mom in two days\", \"dueDate\": \"2025-06-27\", \"time\": \"\"}\n\nNow for this input:\nInput: ${input}\nOutput:`;
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt,
        max_tokens: 120,
        temperature: 0.2,
        stop_sequences: ['\n']
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    let text = response.data.generations[0].text.trim();
    console.log('Cohere raw response:', text);
    let result = {};
    try {
      result = JSON.parse(text);
    } catch (err) {
      // Try to extract JSON substring
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch (err2) {
          console.error('Failed to parse extracted JSON:', match[0]);
          return res.status(500).json({ message: 'Failed to parse AI response', raw: text });
        }
      } else {
        console.error('No JSON found in AI response:', text);
        return res.status(500).json({ message: 'Failed to parse AI response', raw: text });
      }
    }
    // Fallback: if description is empty, use the input
    if (!result.description || !result.description.trim()) {
      result.description = input;
    }
    // Predict priority based on due date
    let priority = 'Medium';
    if (result.dueDate) {
      const due = new Date(result.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) priority = 'High';
      else if (diffDays <= 4) priority = 'Medium';
      else priority = 'Low';
    }
    result.priority = priority;
    console.log('Parsed AI result:', result);
    res.json(result);
  } catch (err) {
    console.error('Cohere error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Cohere error', error: err.response?.data || err.message });
  }
};

exports.aiCommand = async (req, res) => {
  const { prompt: userPrompt } = req.body;
  const apiKey = process.env.COHERE_API_KEY;
  if (!userPrompt) return res.status(400).json({ message: 'Prompt is required' });
  try {
    // Build a few-shot prompt for Cohere
    const today = new Date().toISOString().split('T')[0];
    const coherePrompt = `Today is ${today}. You are an AI assistant for a todo app. Parse the user's prompt and return a JSON array of actions. Each action must have an 'action' key (add, edit, delete, analytics), and for add/edit: title, description, dueDate (YYYY-MM-DD), priority (High/Medium/Low), status (default Not Started if not given). For delete: title. For analytics: query. Always return a valid JSON array.

Example 1:
Prompt: Add a task: title: Buy groceries, due date: Friday, priority: High
Output: [{"action": "add", "title": "Buy groceries", "description": "", "dueDate": "2025-06-28", "priority": "High", "status": "Not Started"}]

Example 2:
Prompt: Add 2 tasks: title: Task 1, due date: tomorrow, priority: Medium; title: Task 2, due date: next week, priority: Low
Output: [{"action": "add", "title": "Task 1", "description": "", "dueDate": "2025-06-26", "priority": "Medium", "status": "Not Started"}, {"action": "add", "title": "Task 2", "description": "", "dueDate": "2025-07-02", "priority": "Low", "status": "Not Started"}]

Example 3:
Prompt: Delete the task called Buy groceries
Output: [{"action": "delete", "title": "Buy groceries"}]

Example 4:
Prompt: Delete 2 tasks: Task 1, Task 2
Output: [{"action": "delete", "title": "Task 1"}, {"action": "delete", "title": "Task 2"}]

Example 5:
Prompt: Delete all tasks
Output: [{"action": "delete", "title": "all tasks"}]

Example 6:
Prompt: Edit the task called Task 1: change due date to July 1st, priority to High
Output: [{"action": "edit", "title": "Task 1", "dueDate": "2025-07-01", "priority": "High"}]

Example 7:
Prompt: Edit 2 tasks: Task 1, change priority to Low; Task 2, change status to Completed
Output: [{"action": "edit", "title": "Task 1", "priority": "Low"}, {"action": "edit", "title": "Task 2", "status": "Completed"}]

Example 8:
Prompt: How many tasks are overdue?
Output: [{"action": "analytics", "query": "overdue count"}]

Example 9:
Prompt: How many tasks are completed?
Output: [{"action": "analytics", "query": "completed count"}]

Example 10:
Prompt: How many tasks have high priority?
Output: [{"action": "analytics", "query": "high priority count"}]

Now for this prompt:
Prompt: ${userPrompt}
Output:`;
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt: coherePrompt,
        max_tokens: 400,
        temperature: 0.2,
        stop_sequences: ['\n']
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    let text = response.data.generations[0].text.trim();
    console.log('Cohere raw response:', text);
    let actions = [];
    try {
      actions = JSON.parse(text);
      console.log('Parsed JSON array from Cohere:', actions);
    } catch (err) {
      // Try to extract JSON substring
      const match = text.match(/\[.*\]/s);
      if (match) {
        try {
          actions = JSON.parse(match[0]);
          console.log('Extracted JSON array from Cohere:', actions);
        } catch (err2) {
          console.error('Failed to parse extracted JSON array:', match[0]);
          return res.status(500).json({ message: 'Failed to parse AI response', raw: text });
        }
      } else {
        console.error('No JSON array found in AI response:', text);
        return res.status(500).json({ message: 'Failed to parse AI response', raw: text });
      }
    }
    // Execute actions
    const userId = req.user._id;
    const results = [];
    for (const action of actions) {
      if (action.action === 'add') {
        const task = await Task.create({
          user: userId,
          title: action.title,
          description: action.description || '',
          dueDate: action.dueDate,
          priority: action.priority || 'Medium',
          status: action.status || 'Not Started',
          activityLog: [{
            action: 'created',
            timestamp: new Date(),
            user: userId,
            details: {
              title: action.title,
              description: action.description || '',
              dueDate: action.dueDate,
              priority: action.priority || 'Medium',
              status: action.status || 'Not Started'
            }
          }]
        });
        results.push({ type: 'add', title: task.title, id: task._id });
      } else if (action.action === 'edit') {
        const task = await Task.findOne({ user: userId, title: action.title });
        if (task) {
          if (action.description) task.description = action.description;
          if (action.dueDate) task.dueDate = action.dueDate;
          if (action.priority) task.priority = action.priority;
          if (action.status) task.status = action.status;
          await task.save();
          results.push({ type: 'edit', title: task.title });
        } else {
          results.push({ type: 'edit', title: action.title, error: 'Task not found' });
        }
      } else if (action.action === 'delete') {
        // Support 'delete all tasks' or similar
        if (action.title && /all tasks|every task|all my tasks|every one|everything|all entries/i.test(action.title)) {
          const deleted = await Task.deleteMany({ user: userId });
          results.push({ type: 'delete', title: action.title, count: deleted.deletedCount });
        } else {
          const task = await Task.findOneAndDelete({ user: userId, title: action.title });
          if (task) {
            results.push({ type: 'delete', title: action.title });
          } else {
            results.push({ type: 'delete', title: action.title, error: 'Task not found' });
          }
        }
      } else if (action.action === 'analytics') {
        // Expanded analytics support
        const query = action.query ? action.query.toLowerCase() : '';
        if (query.includes('overdue')) {
          const now = new Date();
          const overdueCount = await Task.countDocuments({ user: userId, dueDate: { $lt: now }, status: { $ne: 'Completed' } });
          results.push({ type: 'analytics', query: action.query, result: overdueCount });
        } else if (query.includes('completed')) {
          const completedCount = await Task.countDocuments({ user: userId, status: 'Completed' });
          results.push({ type: 'analytics', query: action.query, result: completedCount });
        } else if (query.includes('in progress')) {
          const inProgressCount = await Task.countDocuments({ user: userId, status: 'In Progress' });
          results.push({ type: 'analytics', query: action.query, result: inProgressCount });
        } else if (query.includes('not started')) {
          const notStartedCount = await Task.countDocuments({ user: userId, status: 'Not Started' });
          results.push({ type: 'analytics', query: action.query, result: notStartedCount });
        } else if (query.includes('high priority')) {
          const highPriorityCount = await Task.countDocuments({ user: userId, priority: 'High' });
          results.push({ type: 'analytics', query: action.query, result: highPriorityCount });
        } else if (query.includes('medium priority')) {
          const mediumPriorityCount = await Task.countDocuments({ user: userId, priority: 'Medium' });
          results.push({ type: 'analytics', query: action.query, result: mediumPriorityCount });
        } else if (query.includes('low priority')) {
          const lowPriorityCount = await Task.countDocuments({ user: userId, priority: 'Low' });
          results.push({ type: 'analytics', query: action.query, result: lowPriorityCount });
        } else {
          results.push({ type: 'analytics', query: action.query, error: 'Unsupported analytics query' });
        }
      }
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: 'AI command error', error: err.response?.data || err.message });
  }
};

