import React from 'react';
import type { Todo } from '../../../shared/types/todo.js';
import { TodoItem } from './TodoItem.js';
export function TodoList({ items, onChanged, onEdit }: {
    items: Todo[];
    onChanged: () => void;
    onEdit: (item: Todo) => void;
}) { return items.length ? <ul className="tasks" aria-label="Tasks">{items.map(item => <TodoItem key={item.id} item={item} onChanged={onChanged} onEdit={onEdit}/>)}</ul> : <div className="empty-state"><div className="empty-symbol" aria-hidden="true">✓</div><h2>Your list is clear.</h2><p>A little space for your next idea.<br />Create a task whenever you’re ready.</p></div>; }
