export function toLocalInput(value: string | null) {
    if (!value)
        return '';
    const d = new Date(value);
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function toUtc(value: string, original?: string | null) {
    if (!value)
        return null;
    if (original && value === toLocalInput(original))
        return original;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
        throw new Error('Enter a valid date and time.');
    const d = new Date(value);
    if (!Number.isFinite(d.getTime()) || toLocalInput(d.toISOString()) !== value)
        throw new Error('This local date or time does not exist.');
    return d.toISOString();
}
export function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'No due date'; }
export const padTime = (value: number) => String(value).padStart(2, '0');
export function localToday(nowMs: number) { return toLocalInput(new Date(nowMs).toISOString()).slice(0, 10); }
export function minuteEligible(date: string, hour: string, minute: string, nowMs: number): boolean {
    if (!date || !hour || !minute) return false;
    try { return Date.parse(toUtc(`${date}T${hour}:${minute}`)!) > nowMs; }
    catch { return false; }
}
export function hourEligible(date: string, hour: string, nowMs: number): boolean {
    return Array.from({length:60}, (_,m) => minuteEligible(date, hour, padTime(m), nowMs)).some(Boolean);
}
export type DueDraft = { date: string; hour: string; minute: string; instant: string | null; retained: boolean; zone: string; review: boolean };
export const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export function emptyDue(): DueDraft { return {date:'',hour:'',minute:'',instant:null,retained:false,zone:browserZone(),review:false}; }
export function dueFromInstant(instant: string, retained = false): DueDraft {
    const local = toLocalInput(instant);
    return {...emptyDue(),date:local.slice(0,10),hour:local.slice(11,13),minute:local.slice(14,16),instant,retained};
}
export function changeDue(draft: DueDraft, field: 'date'|'hour'|'minute', value: string): DueDraft {
    const next: DueDraft = {...draft,[field]:value,retained:false,review:false,zone:browserZone(),instant:null};
    if(next.date && next.hour && next.minute) { try { next.instant = toUtc(`${next.date}T${next.hour}:${next.minute}`); } catch { /* Invalid local time remains visible. */ } }
    return next;
}
export function refreshDue(draft: DueDraft): DueDraft {
    if(draft.zone === browserZone()) return draft;
    return draft.instant ? dueFromInstant(draft.instant, draft.retained) : {...draft, zone:browserZone(),review:!!(draft.date || draft.hour || draft.minute)};
}
export function dueErrors(draft: DueDraft, nowMs: number): Partial<Record<'date'|'hour'|'minute', string>> {
    if(draft.retained || !(draft.date || draft.hour || draft.minute)) return {};
    const errors: Partial<Record<'date'|'hour'|'minute', string>> = {};
    if(!draft.date) errors.date = 'Choose a date.';
    if(!draft.hour) errors.hour = 'Choose an hour.';
    if(!draft.minute) errors.minute = 'Choose a minute.';
    if(Object.keys(errors).length) return errors;
    if(!draft.instant) errors.date = 'This local date or time does not exist.';
    else if(Date.parse(draft.instant) <= nowMs) errors.date = 'Choose a future due date and time.';
    return errors;
}
