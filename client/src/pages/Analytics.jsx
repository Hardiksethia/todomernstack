import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';

const COLORS = ['#f87171', '#60a5fa', '#34d399']; // High, Medium, Low
const STATUS_COLORS = ['#34d399', '#60a5fa', '#a1a1aa']; // Completed, In Progress, Not Started

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  // Analytics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Pie chart: Tasks by Priority
  const priorities = ['High', 'Medium', 'Low'];
  const tasksByPriority = priorities.map(priority => ({
    name: priority,
    value: tasks.filter(t => t.priority === priority).length
  }));

  // Bar chart: Tasks by Status
  const statuses = ['Completed', 'In Progress', 'Not Started'];
  const tasksByStatus = statuses.map((status, i) => ({
    name: status,
    value: tasks.filter(t => t.status === status).length,
    fill: STATUS_COLORS[i]
  }));

  // Line chart: Tasks completed over time (by day)
  const completedByDate = {};
  tasks.filter(t => t.status === 'Completed').forEach(t => {
    const date = new Date(t.dueDate).toLocaleDateString('en-CA');
    completedByDate[date] = (completedByDate[date] || 0) + 1;
  });
  const completedOverTime = Object.entries(completedByDate).sort().map(([date, value]) => ({ date, value }));

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600 text-base sm:text-lg">Visualize your productivity and task trends</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center">
            <TrendingUp className="text-orange-500 mb-2" size={32} />
            <span className="text-3xl font-bold text-gray-900">{totalTasks}</span>
            <span className="text-gray-500 mt-1">Total Tasks</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center">
            <CheckCircle className="text-green-500 mb-2" size={32} />
            <span className="text-3xl font-bold text-gray-900">{completedTasks}</span>
            <span className="text-gray-500 mt-1">Completed</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center">
            <AlertCircle className="text-red-500 mb-2" size={32} />
            <span className="text-3xl font-bold text-gray-900">{overdueTasks}</span>
            <span className="text-gray-500 mt-1">Overdue</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center">
            <Clock className="text-blue-500 mb-2" size={32} />
            <span className="text-3xl font-bold text-gray-900">{completionRate}%</span>
            <span className="text-gray-500 mt-1">Completion Rate</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-10">
          {/* Pie Chart: Tasks by Priority */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={tasksByPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {tasksByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Tasks by Status */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks by Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tasksByStatus} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" isAnimationActive>
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Tasks Completed Over Time */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks Completed Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completedOverTime} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 