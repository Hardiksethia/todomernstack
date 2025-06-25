import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar } from 'lucide-react';
import TaskItem from '../components/TaskItem';

const CompletedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    priority: ''
  });

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const fetchCompletedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for completed tasks only
        const completedTasks = data.filter(task => task.status === 'Completed');
        setTasks(completedTasks);
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Date filter
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === filterDate.toDateString();
      });
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    setFilteredTasks(filtered);
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      priority: ''
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Completed Tasks</h1>
        <p className="text-gray-600 text-base sm:text-lg">{tasks.length} completed task{tasks.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Filter Completed Tasks</h3>
          <button
            onClick={clearFilters}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-orange-100 hover:to-orange-200 transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            />
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

      {/* Completed Tasks List Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Completed Tasks</h2>
          <span className="text-sm text-gray-500">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-orange-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed tasks yet</h3>
              <p className="text-gray-500 mb-6">
                {Object.values(filters).some(f => f) 
                  ? 'No completed tasks match your filters' 
                  : 'Complete some tasks to see them here.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onUpdate={fetchCompletedTasks}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedTasks; 