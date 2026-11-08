import { z } from 'zod';
/** Write policy only: response schemas must continue accepting historical instants. */
export function dueDateChangeSchema(current: Date | null | undefined, nowMs: number) {
    return z.object({ dueAt: z.iso.datetime({ offset: true }).nullable().optional() }).refine(
        ({ dueAt }) => dueAt == null || Date.parse(dueAt) === current?.getTime() || Date.parse(dueAt) > nowMs,
        { path: ['dueAt'], message: 'Choose a future due date and time.' },
    );
}
