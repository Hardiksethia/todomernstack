import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Calendar, Tag, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import AlertDialog from './ui/AlertDialog';

const TaskItem = ({ task, onUpdate }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Not Started': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return <AlertCircle size={14} />;
      case 'Medium': return <Clock size={14} />;
      case 'Low': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...task, status: newStatus })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const isOverdue = dueDate < today && task.status !== 'Completed';

  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group ${
        isOverdue ? 'border-red-300 bg-red-50/50' : 'hover:border-orange-200'
      } ${task.status === 'Completed' ? 'opacity-75' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold text-gray-900 mb-1 ${
                  task.status === 'Completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
                )}
              </div>
              
              {/* Status Change Button */}
              {task.status !== 'Completed' && (
                <button
                  onClick={() => handleStatusChange('Completed')}
                  disabled={loading}
                  className="ml-4 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Mark as completed"
                >
                  <CheckCircle size={20} />
                </button>
              )}
            </div>

            {/* Tags and Info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Priority */}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                {task.priority}
              </span>
              
              {/* Status */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={16} className="mr-2" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              to={`/edit-task/${task._id}`}
              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
              title="Edit task"
            >
              <Edit size={18} />
            </Link>
            
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      />
    </>
  );
};

export default TaskItem; 