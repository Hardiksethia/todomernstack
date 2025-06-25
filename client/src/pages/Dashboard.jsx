import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, AlertTriangle, CheckCircle, Clock, TrendingUp, Target, Zap, Sparkles } from 'lucide-react';
import TaskItem from '../components/TaskItem';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch summary and today's tasks in parallel
      const [summaryRes, todayRes] = await Promise.all([
        fetch('http://localhost:5000/api/tasks/summary', { headers }),
        fetch('http://localhost:5000/api/tasks/today', { headers })
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setTodayTasks(todayData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-blue-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const splitUserInput = (input) => {
    // Try to detect 'Add X tasks:' or 'Delete X tasks:' or 'Edit X tasks:'
    const match = input.match(/^(Add|Delete|Edit) \d+ tasks?:/i);
    if (match) {
      const actionPrefix = match[0].replace(/\d+ tasks?:/i, '').trim();
      // Remove the leading 'Add 3 tasks:' part
      const rest = input.replace(match[0], '').trim();
      // Split the rest on semicolons or newlines
      let parts = rest.split(/;|\n|\r/).map(s => s.trim()).filter(Boolean);
      // Prepend the action to each part if not already present
      parts = parts.map(p => (p.toLowerCase().startsWith(actionPrefix.toLowerCase()) ? p : `${actionPrefix}: ${p}`));
      return parts; // Only return the split parts, not the original multi-action prompt
    }
    // Otherwise, split as before
    let parts = input.split(/;|\n|\r|\d+\. /).map(s => s.trim()).filter(Boolean);
    if (parts.length <= 1) return [input.trim()];
    return parts;
  };

  const handleAiCommand = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    const prompts = splitUserInput(aiPrompt);
    const token = localStorage.getItem('token');
    try {
      const results = await Promise.all(
        prompts.map(async prompt => {
          const response = await fetch('http://localhost:5000/api/ai/command', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ prompt })
          });
          if (response.ok) {
            const data = await response.json();
            return data.results;
          } else {
            return [{ type: 'error', error: 'AI could not process: ' + prompt }];
          }
        })
      );
      setAiResult(results.flat());
      setAiPrompt('');
      // Refresh dashboard data if any action is add/edit/delete
      if (results.flat().some(r => ['add','edit','delete'].includes(r.type))) {
        fetchDashboardData();
      }
    } catch (err) {
      setAiError('AI error. Try again.');
    } finally {
      setAiLoading(false);
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
      {/* AI Command Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          AI Command Center
          <Sparkles className="text-orange-400" size={18} />
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAiCommand(); }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g. Add a task: title: Buy groceries, due date: Friday"
            disabled={aiLoading}
          />
          <button
            type="button"
            onClick={handleAiCommand}
            disabled={aiLoading}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2"
          >
            {aiLoading ? <span className="animate-spin"><Sparkles size={18} /></span> : <Sparkles size={18} />}
            <span>Ask AI</span>
          </button>
        </div>
        {aiError && <div className="text-red-500 text-sm mt-2">{aiError}</div>}
        {aiResult && (
          <div className="mt-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-xl p-4">
            <h3 className="font-semibold text-orange-700 mb-2">AI Result</h3>
            <ul className="space-y-2 text-gray-800 text-sm">
              {aiResult.map((r, i) => (
                <li key={i}>
                  {r.type === 'add' && <span>✅ Added task: <b>{r.title}</b></span>}
                  {r.type === 'edit' && <span>✏️ Edited task: <b>{r.title}</b> {r.error && <span className="text-red-500">({r.error})</span>}</span>}
                  {r.type === 'delete' && <span>🗑️ Deleted task: <b>{r.title}</b> {r.error && <span className="text-red-500">({r.error})</span>}</span>}
                  {r.type === 'analytics' && (r.error
                    ? <span>📊 {r.query}: <span className="text-red-500">{r.error}</span></span>
                    : <span>📊 {r.query}: <b>{r.result}</b></span>)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your tasks today</p>
        </div>
        <Link
          to="/add-task"
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Task</span>
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{summary.totalTasks}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Tasks</h3>
            <p className="text-sm text-gray-500 mt-1">All your tasks</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{summary.completed}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Completed</h3>
            <p className="text-sm text-gray-500 mt-1">Great job!</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{summary.inProgress}</span>
            </div>
            <h3 className="text-gray-600 font-medium">In Progress</h3>
            <p className="text-sm text-gray-500 mt-1">Keep going!</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{summary.notStarted}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Not Started</h3>
            <p className="text-sm text-gray-500 mt-1">Ready to begin</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{summary.overdue}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Overdue</h3>
            <p className="text-sm text-gray-500 mt-1">Needs attention</p>
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
                <p className="text-sm text-gray-600">
                  {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} due today
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{todayTasks.length}</div>
              <div className="text-sm text-gray-500">Tasks</div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {todayTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-orange-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks due today</h3>
              <p className="text-gray-500 mb-6">You're all caught up! Time to relax or add some new tasks.</p>
              <Link
                to="/add-task"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
              >
                <Plus size={20} />
                <span>Add a task</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onUpdate={fetchDashboardData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 