import React, {useState} from 'react';
import {DueDateFields} from '../../../src/client/components/todo/DueDateFields.js';
import {emptyDue} from '../../../src/client/utils/datetime.js';
function Fields(){const [value,setValue]=useState(emptyDue);return <DueDateFields value={value} onChange={setValue} original={null} submitted={false} disabled={false}/>;}
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,act} from '@testing-library/react';
import {TodoForm} from '../../../src/client/components/todo/TodoForm.js';
afterEach(()=>vi.useRealTimers());
it('uses blank native calendar/hour/minute controls and disables elapsed choices',()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date(2026,10,8,10,15,30));
 render(<TodoForm onSave={vi.fn()} onCancel={vi.fn()}/>);
 const date=screen.getByLabelText(/^Due date/) as HTMLInputElement;
 expect(date.type).toBe('date');expect(date.min).toBe('2026-11-08');
 const hour=screen.getByLabelText('Hour (24-hour)') as HTMLSelectElement;
 const minute=screen.getByLabelText('Minute') as HTMLSelectElement;
 expect(hour.value).toBe('');expect(minute.value).toBe('');
 fireEvent.change(date,{target:{value:'2026-11-08'}});
 expect(hour.querySelector<HTMLOptionElement>('option[value="09"]')?.disabled).toBe(true);
 fireEvent.change(hour,{target:{value:'10'}});
 expect(minute.querySelector<HTMLOptionElement>('option[value="15"]')?.disabled).toBe(true);
 fireEvent.change(minute,{target:{value:'16'}});
 act(()=>vi.advanceTimersByTime(31000));
 expect(minute.value).toBe('16');expect(screen.getByText('Choose a future due date and time.')).toBeTruthy();
});
it('refreshes on focus and removes listeners and timers on unmount',()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date(2026,10,8,23,59,30));
 const add=vi.spyOn(window,'addEventListener'),remove=vi.spyOn(window,'removeEventListener');
 const view=render(<Fields/>);
 act(()=>{vi.setSystemTime(new Date(2026,10,9));window.dispatchEvent(new Event('focus'));});
 expect((screen.getByLabelText(/^Due date/) as HTMLInputElement).min).toBe('2026-11-09');
 view.unmount();expect(vi.getTimerCount()).toBe(0);
 for(const name of ['focus','pageshow']) {expect(add.mock.calls.some(c=>c[0]===name)).toBe(true);expect(remove.mock.calls.some(c=>c[0]===name)).toBe(true);}
});
it.each(['Due date','Hour (24-hour)','Minute'])('refreshes availability when %s gains focus without a timer or window event',label=>{
 vi.useFakeTimers();vi.setSystemTime(new Date(2026,10,8,10,15,30));
 render(<Fields/>);
 fireEvent.change(screen.getByLabelText('Due date'),{target:{value:'2026-11-08'}});
 fireEvent.change(screen.getByLabelText('Hour (24-hour)'),{target:{value:'10'}});
 fireEvent.change(screen.getByLabelText('Minute'),{target:{value:'16'}});
 vi.setSystemTime(new Date(2026,10,8,10,16));fireEvent.focus(screen.getByLabelText(label));
 expect(screen.getByText('Choose a future due date and time.')).toBeTruthy();
 expect((screen.getByLabelText('Minute') as HTMLSelectElement).querySelector<HTMLOptionElement>('option[value="16"]')?.disabled).toBe(true);
 expect((screen.getByLabelText('Minute') as HTMLSelectElement).value).toBe('16');
 vi.setSystemTime(new Date(2026,10,9));fireEvent.focus(screen.getByLabelText(label));
 expect((screen.getByLabelText('Due date') as HTMLInputElement).min).toBe('2026-11-09');
 expect((screen.getByLabelText('Hour (24-hour)') as HTMLSelectElement).querySelector<HTMLOptionElement>('option[value="10"]')?.disabled).toBe(true);
});
it('explains an exhausted day without scheduling a value and recovers on a future date or midnight',()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date(2026,10,8,23,59,30));
 render(<Fields/>);
 const date=screen.getByLabelText('Due date') as HTMLInputElement;
 const hour=screen.getByLabelText('Hour (24-hour)') as HTMLSelectElement;
 const minute=screen.getByLabelText('Minute') as HTMLSelectElement;
 fireEvent.change(date,{target:{value:'2026-11-08'}});
 expect(screen.getByText('No times remain today. Choose a future date.')).toBeTruthy();
 expect(date.getAttribute('aria-describedby')).toContain('due-exhausted');
 expect(hour.getAttribute('aria-describedby')).toContain('due-exhausted');
 expect(hour.value).toBe('');expect(minute.value).toBe('');
 fireEvent.change(date,{target:{value:'2026-11-09'}});
 expect(screen.queryByText('No times remain today. Choose a future date.')).toBeNull();
 expect(hour.querySelector<HTMLOptionElement>('option[value="00"]')?.disabled).toBe(false);
 fireEvent.change(date,{target:{value:'2026-11-08'}});
 vi.setSystemTime(new Date(2026,10,9));fireEvent.focus(date);
 expect(date.min).toBe('2026-11-09');expect(date.value).toBe('2026-11-08');
 fireEvent.change(date,{target:{value:'2026-11-09'}});
 expect(screen.queryByText('No times remain today. Choose a future date.')).toBeNull();
 expect(hour.value).toBe('');expect(minute.value).toBe('');
 expect(hour.querySelector<HTMLOptionElement>('option[value="00"]')?.disabled).toBe(false);
});
