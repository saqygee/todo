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
