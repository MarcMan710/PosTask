import { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useTag } from '../context/TagContext';
import { PencilIcon, TrashIcon, PlusIcon, CalendarIcon, ListBulletIcon, Bars3Icon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import SubtaskList from './SubtaskList';
import SubtaskForm from './SubtaskForm';
import SearchAndFilter from './SearchAndFilter';
import Calendar from './Calendar';
import { format } from 'date-fns';

const TaskList = () => {
  const { tasks, loading, error, fetchTasks, deleteTask, reorderTasks } = useTask();
  const { tags } = useTag();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isSubtaskFormOpen, setIsSubtaskFormOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    priority: '',
    tags: [],
    date: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, { currentCoordinates }) => {
        return currentCoordinates;
      },
    })
  );

  useEffect(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      await reorderTasks(tasks.map((task, index) => ({
        id: task.id,
        position: index + 1
      })));
    } catch (error) {
      console.error('Error reordering tasks:', error);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleAddSubtask = (taskId) => {
    setSelectedTaskId(taskId);
    setEditingSubtask(null);
    setIsSubtaskFormOpen(true);
  };

  const handleEditSubtask = (taskId, subtask) => {
    setSelectedTaskId(taskId);
    setEditingSubtask(subtask);
    setIsSubtaskFormOpen(true);
  };

  const handleCloseSubtaskForm = () => {
    setIsSubtaskFormOpen(false);
    setEditingSubtask(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setFilters(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'list') {
      setSelectedDate(null);
      setFilters(prev => ({
        ...prev,
        date: null
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                viewMode === 'calendar'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleAddTask}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      <SearchAndFilter
        onFilterChange={handleFilterChange}
        availableTags={tags}
      />

      {viewMode === 'calendar' ? (
        <Calendar
          tasks={tasks}
          onDateClick={handleDateClick}
          selectedDate={selectedDate}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      {task.is_recurring && (
                        <span className="inline-flex items-center text-xs text-gray-500">
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          {task.recurrence_interval} {task.recurrence_pattern}
                          {task.recurrence_end_date && ` until ${format(new Date(task.recurrence_end_date), 'MMM d, yyyy')}`}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {task.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      {task.tags && task.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {task.due_date && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <div className="cursor-grab text-gray-400 hover:text-gray-500">
                      <Bars3Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <SubtaskList
                    taskId={task.id}
                    onAddSubtask={() => handleAddSubtask(task.id)}
                    onEditSubtask={(subtask) => handleEditSubtask(task.id, subtask)}
                  />
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}

      {isSubtaskFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingSubtask ? 'Edit Subtask' : 'Add Subtask'}
            </h2>
            <SubtaskForm
              taskId={selectedTaskId}
              subtask={editingSubtask}
              onClose={handleCloseSubtaskForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList; 