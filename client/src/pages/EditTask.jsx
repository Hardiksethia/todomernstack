import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

const EditTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Not Started'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const task = await response.json();
        setFormData({
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate.split('T')[0],
          priority: task.priority,
          status: task.status
        });
      } else {
        setError('Task not found');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!formData.title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/my-tasks');
      } else {
        setError(data.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
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

  if (error && !formData.title) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-8 gap-2 sm:gap-0">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 w-max"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 sm:mt-0">Edit Task</h1>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-8">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-8 gap-2 sm:gap-0">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 w-max"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 sm:mt-0">Edit Task</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter task description (optional)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-orange-100 hover:to-orange-200 transition-all duration-200 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask; 