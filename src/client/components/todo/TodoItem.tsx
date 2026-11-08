import React, { useState } from 'react';
import { todoApi } from '../../services/todo-api.js';
import { requestError } from '../../services/http.js';
import type { Todo } from '../../../shared/types/todo.js';
import { formatDate } from '../../utils/datetime.js';
export function TodoItem({ item, onChanged, onEdit }: {
    item: Todo;
    onChanged: (message:string) => void;
    onEdit: (item: Todo) => void;
}) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    async function complete() { setPending(true); setError(''); try {
        await todoApi.complete(item.id, !item.completed);
        onChanged(item.completed ? 'Task reopened.' : 'Task completed.');
        document.getElementById('list-heading')?.focus();
    }
    catch (e) {
        setError(requestError(e).message);
    }
    finally {
        setPending(false);
    } }
    async function remove() { setPending(true); setError(''); try {
        await todoApi.remove(item.id);
        onChanged('Task deleted.');
        document.getElementById('list-heading')?.focus();
    }
    catch (e) {
        setError(requestError(e).message);
    }
    finally {
        setPending(false);
    } }
    return <li className={'task' + (item.completed ? ' completed' : '')}><input className="check" type="checkbox" checked={item.completed} disabled={pending} aria-label={`${item.completed ? 'Mark incomplete' : 'Mark complete'}: ${item.title}`} onChange={() => void complete()}/><div className="task-content"><span className="task-status">{item.completed ? 'COMPLETED' : 'TO DO'}</span><h3>{item.title}</h3><p className="description">{item.description ?? 'No description'}</p><div className="task-dates"><span>Due: {formatDate(item.dueAt)}</span><span>Created: {formatDate(item.createdAt)}</span><span>Updated: {formatDate(item.updatedAt)}</span></div>{error && <p role="alert" className="item-error">{error}</p>}</div><div className="task-controls"><button className="item-button" onClick={() => onEdit(item)} aria-label={`Edit: ${item.title}`} disabled={pending}>Edit</button><button className="item-button" onClick={() => void remove()} aria-label={`Delete: ${item.title}`} disabled={pending}>Delete</button></div></li>;
}
