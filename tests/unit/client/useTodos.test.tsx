import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useTodos } from '../../../src/client/hooks/useTodos.js';
import { todoApi } from '../../../src/client/services/todo-api.js';
import type { Todo } from '../../../src/shared/types/todo.js';
vi.mock('../../../src/client/services/todo-api.js', () => ({ todoApi: { list: vi.fn() } }));
function Probe({ filter }: {
    filter: boolean;
}) { const { items } = useTodos(filter); return <p>{items.map(i => i.title).join(',')}</p>; }
it('ignores obsolete list responses after a filter change', async () => {
    let finish: (v: Todo[]) => void = () => { };
    vi.mocked(todoApi.list).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce([{ id: 'x', title: 'Current', description: null, dueAt: null, ordinal: 0, completed: true, deleted: false, createdAt: '2026-11-08T00:00:00Z', updatedAt: '2026-11-08T00:00:00Z' }]);
    const view = render(<Probe filter={false}/>);
    view.rerender(<Probe filter={true}/>);
    await screen.findByText('Current');
    finish([]);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(screen.queryByText('Current')).not.toBeNull();
});
