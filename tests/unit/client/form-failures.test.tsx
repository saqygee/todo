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
    expect(screen.getByLabelText('Title').getAttribute('aria-errormessage')).toBe('title-error');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(false));
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Keep this');
    expect(document.getElementById('title-error')?.previousElementSibling?.tagName).toBe('INPUT');
});
it('rejects partial dates beneath the missing controls and focuses the first missing value',async()=>{
 const save=vi.fn();render(<TodoForm onSave={save} onCancel={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Partial'}});
 fireEvent.change(screen.getByLabelText(/^Due date/),{target:{value:'2099-11-09'}});
 fireEvent.click(screen.getByRole('button',{name:'Save task'}));
 await screen.findByText('Choose an hour.');expect(save).not.toHaveBeenCalled();
 expect(screen.getByLabelText('Hour (24-hour)').getAttribute('aria-errormessage')).toBe('due-hour-error');
 expect(document.activeElement).toBe(screen.getByLabelText('Hour (24-hour)'));
});
it('maps server due errors below the calendar and preserves the failed selection',async()=>{
 const save=vi.fn(async()=>{throw new RequestError('Fix fields',{dueAt:['Server clock: choose a future time.']});});
 render(<TodoForm onSave={save} onCancel={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Keep'}});
 fireEvent.change(screen.getByLabelText(/^Due date/),{target:{value:'2099-11-09'}});
 fireEvent.change(screen.getByLabelText('Hour (24-hour)'),{target:{value:'12'}});
 fireEvent.change(screen.getByLabelText('Minute'),{target:{value:'30'}});
 fireEvent.click(screen.getByRole('button',{name:'Save task'}));
 await screen.findByText('Server clock: choose a future time.');
 expect((screen.getByLabelText(/^Due date/) as HTMLInputElement).value).toBe('2099-11-09');
 expect(document.activeElement).toBe(screen.getByLabelText(/^Due date/));
});
it('preserves a complete unsaved instant when the browser timezone identity changes',async()=>{
 const original=new Intl.DateTimeFormat().resolvedOptions();let zone=original.timeZone;
 const spy=vi.spyOn(Intl.DateTimeFormat.prototype,'resolvedOptions').mockImplementation(()=>({...original,timeZone:zone}));
 try{
 const save=vi.fn(async()=>{});render(<TodoForm onSave={save} onCancel={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Timezone'}});
 fireEvent.change(screen.getByLabelText(/^Due date/),{target:{value:'2099-11-09'}});
 fireEvent.change(screen.getByLabelText('Hour (24-hour)'),{target:{value:'12'}});
 fireEvent.change(screen.getByLabelText('Minute'),{target:{value:'30'}});
 const expected=new Date('2099-11-09T12:30').toISOString();zone='Asia/Tokyo';fireEvent(window,new Event('focus'));
 fireEvent.click(screen.getByRole('button',{name:'Save task'}));
 await waitFor(()=>expect(save).toHaveBeenCalledWith({title:'Timezone',description:null,dueAt:expected}));
 }finally{spy.mockRestore();}
});
it('validates content and the controlled due group together through the form resolver',async()=>{
 const save=vi.fn();render(<TodoForm onSave={save} onCancel={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText(/^Due date/),{target:{value:'2099-11-09'}});
 fireEvent.click(screen.getByRole('button',{name:'Save task'}));
 await screen.findByText('Enter a title.');
 expect(await screen.findByText('Choose an hour.')).toBeTruthy();
 expect(screen.getByText('Choose a minute.')).toBeTruthy();
 expect(save).not.toHaveBeenCalled();
 expect(document.activeElement).toBe(screen.getByLabelText('Title'));
 fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Complete group'}});
 fireEvent.click(screen.getByRole('button',{name:'Clear due date'}));
 fireEvent.click(screen.getByRole('button',{name:'Save task'}));
 await waitFor(()=>expect(save).toHaveBeenCalledWith({title:'Complete group',description:null,dueAt:null}));
 expect(screen.queryByText('Choose an hour.')).toBeNull();
});
