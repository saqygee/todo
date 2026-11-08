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
