import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

const actionLabels = {
  created: 'Task Created',
  updated: 'Task Updated',
  deleted: 'Task Deleted',
  title_changed: 'Title Changed',
  description_changed: 'Description Changed',
  dueDate_changed: 'Due Date Changed',
  priority_changed: 'Priority Changed',
  status_changed: 'Status Changed',
  category_changed: 'Category Changed',
};

const getDetailsText = (log) => {
  if (!log.details) return null;
  if (log.action.endsWith('_changed') && log.details.from !== undefined && log.details.to !== undefined) {
    let label = '';
    switch (log.action) {
      case 'title_changed':
        label = `Title changed from "${log.details.from}" to "${log.details.to}"`;
        break;
      case 'description_changed':
        label = `Description changed`;
        break;
      case 'dueDate_changed':
        label = `Due date changed from ${new Date(log.details.from).toLocaleDateString()} to ${new Date(log.details.to).toLocaleDateString()}`;
        break;
      case 'priority_changed':
        label = `Priority changed from ${log.details.from} to ${log.details.to}`;
        break;
      case 'status_changed':
        label = `Status changed from ${log.details.from} to ${log.details.to}`;
        break;
      case 'category_changed':
        label = `Category changed from ${log.details.from} to ${log.details.to}`;
        break;
      default:
        label = `${log.action.replace('_', ' ')}: ${JSON.stringify(log.details)}`;
    }
    return label;
  }
  if (log.action === 'created' || log.action === 'deleted') {
    return `Task details: ${log.details.title}`;
  }
  return null;
};

const getAllActionTypes = (activityLog) => {
  const set = new Set(activityLog.map(log => log.action));
  return Array.from(set);
};

const ActivityLog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activityLog, setActivityLog] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivityLog();
    // eslint-disable-next-line
  }, [id]);

  const fetchActivityLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const task = await response.json();
        setActivityLog(task.activityLog || []);
        setTaskTitle(task.title);
      } else {
        setError('Task not found');
      }
    } catch (err) {
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const filteredLog = filter === 'all' ? activityLog : activityLog.filter(log => log.action === filter);
  const allActionTypes = getAllActionTypes(activityLog);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Activity Log</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-orange-600">{taskTitle}</h2>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded-lg border ${filter === 'all' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-700 border-gray-200'} font-medium transition-all`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {allActionTypes.map(type => (
              <button
                key={type}
                className={`px-4 py-2 rounded-lg border ${filter === type ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-700 border-gray-200'} font-medium transition-all`}
                onClick={() => setFilter(type)}
              >
                {actionLabels[type] || type}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : filteredLog.length === 0 ? (
            <div className="text-center text-gray-500">No activity for this filter.</div>
          ) : (
            <ul className="space-y-6">
              {filteredLog.slice().reverse().map((log, idx) => (
                <li key={idx} className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Clock className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{actionLabels[log.action] || log.action}</div>
                    <div className="text-gray-500 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {getDetailsText(log) && (
                      <div className="text-gray-600 text-sm mt-1">{getDetailsText(log)}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog; 