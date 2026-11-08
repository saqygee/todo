import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodosPage } from '../../../src/client/pages/TodosPage.js';
import { todoApi } from '../../../src/client/services/todo-api.js';
const { task } = vi.hoisted(() => ({ task: { id: 'f5f24d2f-7a55-4aeb-b101-5b28d2040b82', title: 'A task', description: null, dueAt: null, ordinal: 0, completed: false, deleted: false as const, createdAt: '2026-11-08T12:00:00Z', updatedAt: '2026-11-08T12:00:00Z' } }));
vi.mock('../../../src/client/services/todo-api.js', () => ({ todoApi: { list: vi.fn(async () => [task]), complete: vi.fn(async () => ({ ...task, completed: true })) } }));
it('toggles inclusive visibility and sends explicit completion targets', async () => {
    render(<TodosPage />);
    await screen.findByText('A task');
    const show = screen.getByRole('button', { name: 'Display completed' });
    fireEvent.click(show);
    await waitFor(() => expect(todoApi.list).toHaveBeenLastCalledWith(true, expect.anything()));
    expect(show.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(await screen.findByRole('checkbox'));
    await waitFor(() => expect(todoApi.complete).toHaveBeenCalledWith(task.id, true));
    fireEvent.click(show);
    await waitFor(() => expect(todoApi.list).toHaveBeenLastCalledWith(false, expect.anything()));
});
