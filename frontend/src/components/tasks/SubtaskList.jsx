import { useEffect } from 'react';
import { useSubtask } from '../context/SubtaskContext';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const SubtaskList = ({ taskId, onAddSubtask, onEditSubtask }) => {
  const { 
    subtasks,
    loading,
    error,
    fetchSubtasks,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks
  } = useSubtask();

  useEffect(() => { 
    fetchSubtasks(taskId);
  }, [taskId, fetchSubtasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, { currentCoordinates }) => {
        // Custom coordinate getter for keyboard sensor if needed 
        return currentCoordinates;
      },
    })
  );

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const startPosition = result.source.index + 1;
    const endPosition = result.destination.index + 1;

    if (startPosition === endPosition) return;

    try {
      await reorderSubtasks(taskId, startPosition, endPosition);
    } catch (error) {
      console.error('Error reordering subtasks:', error);
    }
  };

  if (loading[taskId]) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
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

  const taskSubtasks = subtasks[taskId] || [];

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Subtasks</h3>
        <button
          onClick={() => onAddSubtask(taskId)}
          className="text-primary-600 hover:text-primary-700"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      {taskSubtasks.length === 0 ? (
        <p className="text-sm text-gray-500">No subtasks yet. Add one to get started!</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`subtasks-${taskId}`}>
 <DndContext 
 sensors={sensors}
 collisionDetection={closestCorners}
 onDragEnd={handleDragEnd}
 > 
 <div className="space-y-2">
 {taskSubtasks.map((subtask, index) => (
 <Draggable key={subtask.id} draggableId={subtask.id.toString()} index={index}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={`flex items-center justify-between p-2 rounded-md ${
 snapshot.isDragging
 ? 'bg-primary-50 ring-2 ring-primary-500'
 : 'bg-gray-50 hover:bg-gray-100'
 }`} 
 >
 <div className="flex items-center space-x-2">
 <input
 type="checkbox"
 checked={subtask.status === 'completed'}
 onChange={() => {
 const newStatus = subtask.status === 'completed' ? 'pending' : 'completed';
 updateSubtask(subtask.id, { ...subtask, status: newStatus });
 }}
 className="h-4 w-4 text-primary-600 rounded border-gray-300"
 /> 
 <span className={`text-sm ${
 subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'
 }`}> 
 {subtask.title}
 </span>
 </div>
 <div className="flex space-x-2"> 
 <button onClick={() => onEditSubtask(subtask)} className="text-gray-400 hover:text-primary-600"><PencilIcon className="h-4 w-4" /></button>
 <button onClick={() => deleteSubtask(subtask.id, taskId)} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
 </div>
 </div>
 )}
 </Draggable>
 ))}
 </div>
 </DndContext>
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default SubtaskList; 