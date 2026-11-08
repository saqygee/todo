import React from 'react';
import { it,expect,vi } from 'vitest';
import { render,screen,fireEvent } from '@testing-library/react';
import { TodosPage } from '../../../src/client/pages/TodosPage.js';
import { todoApi } from '../../../src/client/services/todo-api.js';
vi.mock('../../../src/client/services/todo-api.js',()=>({todoApi:{list:vi.fn()}}));
it('distinguishes loading failure from empty success and offers retry',async()=>{
 vi.mocked(todoApi.list).mockRejectedValueOnce(new Error('internal failure')).mockResolvedValueOnce([]);
 render(<TodosPage/>);const error=await screen.findByRole('alert');expect(error.textContent).not.toContain('internal failure');expect(screen.queryByText('Your list is clear.')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByText('Your list is clear.');
});
