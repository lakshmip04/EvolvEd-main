import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Timer from '../components/Timer';

function Tasks() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sessionActive, setSessionActive] = useState(false);
  
  // Sample tasks data - would be fetched from Redux in a complete implementation
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Complete React assignment',
      description: 'Implement a todo list component with Redux',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      priority: 'high',
      completed: false,
      category: 'Assignments'
    },
    {
      id: 2,
      title: 'Study MongoDB aggregation',
      description: 'Learn about $match, $group, $project operators',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      priority: 'medium',
      completed: false,
      category: 'Study'
    },
    {
      id: 3,
      title: 'Review JavaScript closures',
      description: 'Make sure to understand lexical environment',
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      priority: 'low',
      completed: true,
      category: 'Study'
    },
    {
      id: 4,
      title: 'Prepare for Node.js interview',
      description: 'Review common interview questions about Node.js',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
      priority: 'high',
      completed: false,
      category: 'Career'
    }
  ]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().substring(0, 10),
    priority: 'medium',
    category: ''
  });
  
  // State for showing add task form
  const [showAddTask, setShowAddTask] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };
  
  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const addTask = (e) => {
    e.preventDefault();
    
    const task = {
      id: Date.now(),
      ...newTask,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().substring(0, 10),
      priority: 'medium',
      category: ''
    });
    setShowAddTask(false);
  };
  
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  
  // Sort tasks by due date and priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // For incomplete tasks, sort by due date first
    if (!a.completed && !b.completed) {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      
      // If due dates are the same, sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // For completed tasks, sort by completion date (would need a completedAt field in a real implementation)
    return 0;
  });

  const handleTimerComplete = () => {
    alert('Study session complete! Take a break.');
    setSessionActive(false);
    
    // Save session data to localStorage
    const today = new Date().toISOString().split('T')[0];
    const savedHistory = localStorage.getItem('studyHistory');
    let studyHistory = savedHistory ? JSON.parse(savedHistory) : [];
    
    const todayIndex = studyHistory.findIndex(item => item.date === today);
    if (todayIndex >= 0) {
      studyHistory[todayIndex].minutes += 25;
    } else {
      studyHistory.push({ date: today, minutes: 25 });
    }
    
    localStorage.setItem('studyHistory', JSON.stringify(studyHistory));
    
    // Update total study time
    const savedTime = localStorage.getItem('totalStudyTime');
    const totalTime = savedTime ? parseInt(savedTime) : 0;
    localStorage.setItem('totalStudyTime', (totalTime + 25 * 60).toString());
  };
  
  const startStudySession = () => {
    setSessionActive(true);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <div className="flex items-center space-x-4">
            {!sessionActive ? (
              <button 
                onClick={startStudySession}
                className="bg-green-600 text-white rounded-md px-4 py-2 text-base font-medium inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Study Session
              </button>
            ) : (
              <div className="flex items-center bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-2">
                <span className="text-green-700 dark:text-green-300 mr-3">Current Session:</span>
                <Timer initialMinutes={25} onComplete={handleTimerComplete} />
              </div>
            )}
            <button 
              onClick={() => setShowAddTask(!showAddTask)}
              className="bg-custom text-white rounded-md px-4 py-2 text-base font-medium inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
        
        {/* Study Session Info */}
        {sessionActive && (
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                Study Session in Progress
              </h3>
            </div>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              Focus on your tasks and avoid distractions. The timer will notify you when it's time for a break.
            </p>
          </div>
        )}
        
        {/* Task Form */}
        {showAddTask && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Task</h2>
            <form onSubmit={addTask}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Task Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={newTask.title}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm block w-full sm:text-sm rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={newTask.description}
                      onChange={handleInputChange}
                      className="shadow-sm block w-full sm:text-sm rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      value={newTask.dueDate}
                      onChange={handleInputChange}
                      className="shadow-sm block w-full sm:text-sm rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <div className="mt-1">
                    <select
                      id="priority"
                      name="priority"
                      value={newTask.priority}
                      onChange={handleInputChange}
                      className="shadow-sm block w-full sm:text-sm rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="category"
                      id="category"
                      value={newTask.category}
                      onChange={handleInputChange}
                      className="shadow-sm block w-full sm:text-sm rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-custom hover:bg-custom-dark py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Task Filters */}
        <div className="flex space-x-1 mb-6">
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-custom text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'active' ? 'bg-custom text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'completed' ? 'bg-custom text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        
        {/* Task List */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new task.
              </p>
            </div>
          ) : (
            sortedTasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-start p-4 rounded-lg ${task.completed ? 'bg-gray-50 dark:bg-gray-700 opacity-75' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="h-4 w-4 mt-1 text-custom border-gray-300 rounded cursor-pointer"
                />
                <div className="ml-3 flex-1 flex justify-between">
                  <div>
                    <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </p>
                    <p className={`mt-1 text-xs ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      {task.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {task.category}
                        </span>
                      )}
                      <span className={`text-xs ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks; 