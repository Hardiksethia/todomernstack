const express = require('express');
const router = express.Router();
const {
 createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTodayTasks,
  getOverdueTasks,
  getUpcomingTasks,
  getTasksByDate,
  getUserCategories,
  getTasksByCategory,
  getDatesWithTasks,
   getTaskSummary,
   searchTasks,
   suggestCategoryAPI,
   parseTaskInput,
   aiCommand
} = require('../controllers/taskController');


const protect = require('../middlewares/authMiddleware');

router.post('/', protect, createTask);
router.get('/', protect, getTasks);
router.get('/today', protect, getTodayTasks);
router.get('/overdue', protect, getOverdueTasks);
router.get('/upcoming', protect, getUpcomingTasks);
router.get('/date/:date', protect, getTasksByDate);
router.get('/dates-with-tasks', protect, getDatesWithTasks);
router.get('/summary', protect, getTaskSummary);
router.get('/search', protect, searchTasks);

router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;



