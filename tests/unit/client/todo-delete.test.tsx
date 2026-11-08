import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodosPage } from '../../../src/client/pages/TodosPage.js';
import { todoApi } from '../../../src/client/services/todo-api.js';
const { task } = vi.hoisted(() => ({ task: { id: 'f5f24d2f-7a55-4aeb-b101-5b28d2040b82', title: 'A task', description: null, dueAt: null, ordinal: 0, completed: false, deleted: false as const, createdAt: '2026-11-08T12:00:00Z', updatedAt: '2026-11-08T12:00:00Z' } }));
vi.mock('../../../src/client/services/todo-api.js', () => ({ todoApi: { list: vi.fn(async () => [task]), remove: vi.fn(async () => { }) } }));
it('deletes and reloads the list with a clear empty state', async () => {
    vi.mocked(todoApi.list).mockResolvedValueOnce([task]).mockResolvedValueOnce([]);
    render(<TodosPage />);
    await screen.findByText('A task');
    fireEvent.click(screen.getByRole('button', { name: 'Delete: A task' }));
    await waitFor(() => expect(todoApi.remove).toHaveBeenCalledWith(task.id));
    await screen.findByText('Your list is clear.');
    expect(screen.getByRole('button', { name: 'create new task' })).toBeDefined();
});
