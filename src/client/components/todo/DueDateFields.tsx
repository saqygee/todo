import React, {useCallback, useEffect, useState} from 'react';
import {type DueDraft, dueErrors, refreshDue, changeDue, emptyDue, dueFromInstant, formatDate, localToday, hourEligible, minuteEligible, padTime} from '../../utils/datetime.js';
type Props = {value:DueDraft; onChange:(value:DueDraft)=>void; original:string|null; submitted:boolean; fieldErrors?:Partial<Record<'date'|'hour'|'minute',string>>; error?:string; disabled:boolean};
export function DueDateFields({value,onChange,original,submitted,fieldErrors = {},error,disabled}:Props) {
    const [now,setNow]=useState(Date.now);
    const refresh=useCallback(()=>{setNow(Date.now());const next=refreshDue(value);if(next !== value) onChange(next);},[value,onChange]);
    useEffect(()=>{
        let timer:ReturnType<typeof setTimeout>;
        const tick=()=>{refresh();timer=setTimeout(tick,60000-Date.now()%60000+10);};
        timer=setTimeout(tick,60000-Date.now()%60000+10);
        window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);
        return()=>{clearTimeout(timer);window.removeEventListener('focus',refresh);window.removeEventListener('pageshow',refresh);};
    },[refresh]);
    const issues=dueErrors(value,now);
    const expired=!!value.instant && !value.retained && Date.parse(value.instant)<=now;
    const visible=submitted || expired;
    function update(field:'date'|'hour'|'minute',text:string) {setNow(Date.now());onChange(changeDue(refreshDue(value),field,text));}
    const dateError=error || fieldErrors.date || (visible ? issues.date : undefined);
    const hours=Array.from({length:24},(_,hour)=>padTime(hour));
    const availableHours=new Map(hours.map(hour=>[hour,hourEligible(value.date,hour,now)]));
    const exhausted=!value.retained && value.date===localToday(now) && ![...availableHours.values()].some(Boolean);
    const message=(field:'date'|'hour'|'minute',text?:string)=><>{text && <p id={`due-${field}-error`} className="field-error" role="alert">{text}</p>}</>;
    const attrs=(field:'date'|'hour'|'minute',text?:string)=>({'aria-invalid':!!text,'aria-errormessage':text?`due-${field}-error`:undefined,'aria-describedby':[text?`due-${field}-error`:'due-hint',exhausted?'due-exhausted':null].filter(Boolean).join(' ')});
    return <fieldset className="due-fields" disabled={disabled} onFocusCapture={refresh}><legend>Due date and time <span className="optional">Optional</span></legend><p id="due-hint" className="hint">Your local time. Choose a future date and time, or leave all three blank.</p>
    {value.retained ? <><p>Current due date: <time dateTime={value.instant!}>{formatDate(value.instant)}</time></p><button id="due-date" type="button" className="secondary" onClick={()=>onChange(emptyDue())} {...attrs('date',dateError)}>Change due date</button>{message('date',dateError)}</> : <div className="due-controls">
    <div className="field"><label htmlFor="due-date">Due date</label><input id="due-date" type="date" min={localToday(now)} value={value.date} onChange={e=>update('date',e.target.value)} {...attrs('date',dateError)}/>{message('date',dateError)}{exhausted && <p id="due-exhausted" className="hint" role="status">No times remain today. Choose a future date.</p>}</div>
    <div className="field"><label htmlFor="due-hour">Hour (24-hour)</label><select id="due-hour" value={value.hour} onChange={e=>update('hour',e.target.value)} {...attrs('hour',fieldErrors.hour || (visible?issues.hour:undefined))}><option value="">Choose hour</option>{hours.map(h=><option key={h} value={h} disabled={!availableHours.get(h)}>{h}</option>)}</select>{message('hour',fieldErrors.hour || (visible?issues.hour:undefined))}</div>
    <div className="field"><label htmlFor="due-minute">Minute</label><select id="due-minute" value={value.minute} onChange={e=>update('minute',e.target.value)} {...attrs('minute',fieldErrors.minute || (visible?issues.minute:undefined))}><option value="">Choose minute</option>{Array.from({length:60},(_,m)=>padTime(m)).map(m=><option key={m} value={m} disabled={!minuteEligible(value.date,value.hour,m,now)}>{m}</option>)}</select>{message('minute',fieldErrors.minute || (visible?issues.minute:undefined))}</div></div>}
    {value.review && <p role="status">Your timezone changed. Review the date and time before saving.</p>}
    <div className="due-actions">{!value.retained && original && <button type="button" className="secondary" onClick={()=>onChange(dueFromInstant(original,true))}>Keep existing due date</button>}{(value.date || value.hour || value.minute) && <button type="button" className="secondary" onClick={()=>onChange(emptyDue())}>Clear due date</button>}</div>
    </fieldset>;
}
