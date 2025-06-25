import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar as CalendarIcon } from 'lucide-react';
import TaskItem from '../components/TaskItem';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    priority: ''
  });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, filters]);

  useEffect(() => {
    const tiles = document.querySelectorAll('.react-calendar__tile[style]');
    tiles.forEach(tile => {
      tile.style.background = 'transparent';
    });
  });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === filterDate.toDateString();
      });
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    setFilteredTasks(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      date: '',
      status: '',
      priority: ''
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const priorityColors = {
    High: 'bg-red-400',
    Medium: 'bg-blue-400',
    Low: 'bg-green-400',
  };

  // Map of date string (YYYY-MM-DD) to highest priority
  const datePriorityMap = {};
  tasks.forEach(task => {
    const date = new Date(task.dueDate).toLocaleDateString('en-CA');
    if (!datePriorityMap[date]) {
      datePriorityMap[date] = task.priority;
    } else {
      // High > Medium > Low
      if (task.priority === 'High' ||
          (task.priority === 'Medium' && datePriorityMap[date] === 'Low')) {
        datePriorityMap[date] = task.priority;
      }
    }
  });

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'High': return '#f87171'; // Tailwind red-400
      case 'Medium': return '#60a5fa'; // Tailwind blue-400
      case 'Low': return '#34d399'; // Tailwind green-400
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">My Tasks</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCalendar(true)}
            className="p-3 rounded-full bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border border-orange-200 shadow text-orange-600 hover:text-orange-800 transition-all"
            title="Show Calendar"
          >
            <CalendarIcon size={24} />
          </button>
          <Link
            to="/add-task"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            />
          </div>
          <button
            onClick={clearFilters}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-orange-100 hover:to-orange-200 transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            >
              <option value="">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">All Tasks</h2>
          <span className="text-sm text-gray-500">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="text-orange-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'No tasks match your filters' 
                  : 'You have not created any tasks yet.'
                }
              </p>
              {!searchTerm && !Object.values(filters).some(f => f) && (
                <Link
                  to="/add-task"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus size={20} />
                  <span>Create your first task</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onUpdate={fetchTasks}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Modal/Popover */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
            <button
              onClick={() => setShowCalendar(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
              title="Close"
            >
              ×
            </button>
            <Calendar
              tileClassName={() => 'relative'}
              tileContent={({ date, view }) => {
                if (view === 'month') {
                  const dateStr = date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0');
                  const priority = datePriorityMap[dateStr];
                  if (priority) {
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: 28,
                          height: 28,
                          transform: 'translate(-50%, -50%)',
                          borderRadius: '50%',
                          background: getPriorityBg(priority),
                          zIndex: 0,
                          pointerEvents: 'none',
                          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                          transition: 'background 0.2s',
                        }}
                      />
                    );
                  }
                }
                return null;
              }}
              value={null}
              defaultValue={null}
              selectRange={false}
              onClickDay={() => {}}
            />
            <div className="flex justify-center gap-6 mt-6 text-base font-medium text-gray-700">
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-red-400 inline-block"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-blue-400 inline-block"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-green-400 inline-block"></span> Low</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks; 