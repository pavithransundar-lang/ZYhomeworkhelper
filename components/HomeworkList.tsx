import React, { useState } from 'react';
import { HomeworkItem } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface HomeworkListProps {
  items: HomeworkItem[];
  onAddItem: (text: string, dueDate: string, category: string) => void;
  onDeleteItem: (id: number) => void;
  onToggleItem: (id: number) => void;
}

const EmptyState = () => (
    <div className="text-center py-16">
        <div className="inline-block bg-slate-700 p-6 rounded-full">
            <svg className="w-16 h-16 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold">No tasks yet</h3>
        <p className="text-slate-400 mt-1">Add a task using the form above to get started.</p>
    </div>
);


const HomeworkList: React.FC<HomeworkListProps> = ({ items, onAddItem, onDeleteItem, onToggleItem }) => {
  const [newItemText, setNewItemText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    onAddItem(newItemText, newDueDate, newCategory);
    setNewItemText('');
    setNewDueDate('');
    setNewCategory('');
  };

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Manage Tasks</h2>
        {/* Tabs can be added here */}
      </div>
      
      <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row items-end gap-2 mb-6 pb-6 border-b border-white/10">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add a new task..."
              className="w-full md:col-span-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category (e.g. Math)"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Category"
            />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-400"
              aria-label="Due date"
            />
        </div>
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white rounded-lg p-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 w-full sm:w-auto"
          disabled={!newItemText.trim()}
          aria-label="Add homework"
        >
          <PlusIcon />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 bg-slate-700/50 p-3 rounded-lg border border-transparent hover:border-sky-500 transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleItem(item.id)}
                    className="form-checkbox h-5 w-5 text-sky-500 bg-slate-800 border-slate-600 rounded focus:ring-sky-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                      <span className={`block break-words ${item.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {item.text}
                      </span>
                      <div className="flex items-center flex-wrap gap-x-2 mt-1">
                          {item.category && (
                              <span className="inline-block bg-sky-800 text-sky-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  {item.category}
                              </span>
                          )}
                          {item.dueDate && (
                              <span className="text-xs text-slate-400">
                                  Due: {new Date(item.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                              </span>
                          )}
                      </div>
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors duration-300 ml-auto opacity-50 hover:opacity-100"
                    aria-label={`Delete ${item.text}`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
};

export default HomeworkList;