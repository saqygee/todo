import React, { useEffect, useRef, useState } from 'react';
import type { Todo } from '../../shared/types/todo.js';
import { useTodos } from '../hooks/useTodos.js';
import { TodoList } from '../components/todo/TodoList.js';
import { TodoListActions } from '../components/todo/TodoListActions.js';
import { TodoForm } from '../components/todo/TodoForm.js';
import { todoApi } from '../services/todo-api.js';
export function TodosPage() {
    const [editing, setEditing] = useState<Todo | undefined>();
    const [includeCompleted, setIncludeCompleted] = useState(false);
    const [creating, setCreating] = useState(false);
    const [notice, setNotice] = useState('');
    const { items, loading, error, refresh } = useTodos(includeCompleted);
    const returned = useRef(false);
    useEffect(() => { if (!creating && returned.current) {
        document.querySelector<HTMLButtonElement>('.list-actions button')?.focus();
        returned.current = false;
    } }, [creating]);
    return <><div className="section-heading"><div><span className="eyebrow">A CLEARER DAY STARTS HERE</span><h1>Your everyday,<br /><em>a little lighter.</em></h1></div><span className="section-number" aria-hidden="true">01 / TASKS</span></div><div role="status" className="notice">{notice}</div>
 {creating ? <TodoForm item={editing} onCancel={() => { returned.current = true; setCreating(false); }} onSave={async (input) => { if (editing)
        await todoApi.update(editing.id, input);
    else
        await todoApi.create(input); returned.current = true; setCreating(false); setNotice(editing ? 'Task updated.' : 'Task created.'); refresh(); }}/> : <div className="list-layout"><TodoListActions includeCompleted={includeCompleted} onCreate={() => { setEditing(undefined); setCreating(true); setNotice(''); }} onToggle={() => setIncludeCompleted(v => !v)}/><section className="list-panel" aria-labelledby="list-heading"><div className="list-header"><h2 id="list-heading" tabIndex={-1}>{includeCompleted ? 'All tasks' : 'Your tasks'}</h2><span className="count">{items.length} {items.length === 1 ? 'task' : 'tasks'}</span></div>{loading ? <p role="status" className="loading">Loading your tasks…</p> : error ? <div className="error-banner" role="alert"><p>{error}</p><button className="secondary" onClick={refresh}>Retry</button></div> : <TodoList items={items} onEdit={item => { setEditing(item); setCreating(true); setNotice(''); }} onChanged={message => { refresh(); setNotice(message); }}/>}</section></div>}</>;
}
