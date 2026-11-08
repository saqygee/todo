import React from 'react';
export function TodoListActions({ includeCompleted, onCreate, onToggle }: {
    includeCompleted: boolean;
    onCreate: () => void;
    onToggle: () => void;
}) {
    return <aside className="list-actions" aria-label="Task list actions"><button className="primary" onClick={onCreate}>create new task</button><button className="secondary" aria-pressed={includeCompleted} onClick={onToggle}>Display completed</button><p className="aside-note">One thing at a time.<br />You’ve got this.</p></aside>;
}
