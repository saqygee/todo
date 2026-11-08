import React from 'react';
export function TodoListActions({ includeCompleted, onCreate, onToggle }: {
    includeCompleted: boolean;
    onCreate: () => void;
    onToggle: () => void;
}) {
    return <aside className="list-actions" aria-label="Task list actions"><button className="primary" onClick={onCreate}>create new task</button><button className="secondary" aria-pressed={includeCompleted} onClick={onToggle}><span className="filter-indicator" aria-hidden="true">{includeCompleted ? "✓" : ""}</span>Display completed</button></aside>;
}
