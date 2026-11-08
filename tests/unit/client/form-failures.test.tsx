import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoForm } from '../../../src/client/components/todo/TodoForm.js';
import { RequestError } from '../../../src/client/services/http.js';
it('retains entered content and re-enables controls after server validation failure', async () => {
    const save = vi.fn(async () => { throw new RequestError('Fix fields', { title: ['Title rejected'] }); });
    render(<TodoForm onSave={save} onCancel={() => { }}/>);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Keep this' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    await screen.findByText('Title rejected');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(false));
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Keep this');
    expect(document.getElementById('title-error')?.previousElementSibling?.tagName).toBe('INPUT');
});
