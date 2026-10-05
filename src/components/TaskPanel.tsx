import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, CheckSquare } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { TaskItem, CharacterState } from '../types';
import { loadStoredTasks, saveStoredTasks } from '../store/companionStore';

interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  onCharacterStateChange: (state: CharacterState) => void;
  onSpeak: (message: string, duration?: number, newState?: CharacterState) => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  isOpen,
  onClose,
  onBackToMenu,
  onCharacterStateChange,
  onSpeak,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadStoredTasks());
  const [newTaskText, setNewTaskText] = useState<string>('');

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = !t.completed;
          if (updated) {
            onCharacterStateChange('excited');
            onSpeak('Task completed! 🎉 Awesome job!', 4, 'excited');
          }
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText('');
    onSpeak("New task added! Let's get to it! 📝", 3, 'happy');
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <FloatingPanel
      title="Today's Tasks"
      icon={<CheckSquare size={16} />}
      isOpen={isOpen}
      onClose={onClose}
      onBackToMenu={onBackToMenu}
      className="miko-task-panel-container"
    >
      <div className="miko-task-header-progress">
        <span className="miko-task-badge">
          {completedCount} / {tasks.length} Completed
        </span>
        <div className="miko-task-bar-track">
          <div
            className="miko-task-bar-fill"
            style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <form className="miko-task-add-form" onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          className="miko-task-input"
        />
        <button
          type="submit"
          className="miko-task-add-btn"
          disabled={!newTaskText.trim()}
          title="Add Task"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="miko-task-list">
        {tasks.length === 0 ? (
          <div className="miko-empty-tasks">
            <span>No tasks for today! Enjoy your free time! 🌸</span>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`miko-task-item ${task.completed ? 'completed' : ''}`}
              onClick={() => handleToggleTask(task.id)}
            >
              <div className="miko-task-checkbox">
                {task.completed && <Check size={12} className="stroke-[3]" />}
              </div>
              <span className="miko-task-label">{task.text}</span>
              <button
                className="miko-task-delete-btn"
                onClick={(e) => handleDeleteTask(task.id, e)}
                title="Delete task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </FloatingPanel>
  );
};
