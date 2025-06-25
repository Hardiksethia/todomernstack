import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaskItem from '../components/TaskItem';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchTasksByCategory(selectedCategory);
    } else {
      setTasks([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksByCategory = async (category) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/category/${category}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks by category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
        <Link
          to="/add-task"
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <span>Add Task</span>
        </Link>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-orange-600">All Categories</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500">No categories found.</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-6 py-3 rounded-xl border font-semibold text-lg transition-all duration-200 ${selectedCategory === cat ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-orange-100 hover:text-orange-700'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
            {selectedCategory && (
              <button
                className="ml-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300 transition-all"
                onClick={() => setSelectedCategory('')}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
      {selectedCategory && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-orange-600">Tasks in "{selectedCategory}"</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500">No tasks in this category.</div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskItem key={task._id} task={task} onUpdate={() => fetchTasksByCategory(selectedCategory)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories; 