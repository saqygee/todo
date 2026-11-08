import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTodoSchema } from '../../../shared/schemas/todo.schema.js';
import type { CreateTodo, Todo } from '../../../shared/types/todo.js';
import { toUtc, toLocalInput } from '../../utils/datetime.js';
import { requestError } from '../../services/http.js';
const formSchema = z.object({ title: createTodoSchema.shape.title, description: z.string().trim().max(500, 'Description must contain at most 500 characters.'), dueAt: z.string().refine(v => { try {
        toUtc(v);
        return true;
    }
    catch {
        return false;
    } }, 'Enter a valid local date and time.') });
type Values = z.infer<typeof formSchema>;
export function TodoForm({ item, onSave, onCancel }: {
    item?: Todo;
    onSave: (input: CreateTodo) => Promise<void>;
    onCancel: () => void;
}) {
    const { register, handleSubmit, setError, setFocus, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(formSchema), defaultValues: { title: item?.title ?? '', description: item?.description ?? '', dueAt: toLocalInput(item?.dueAt ?? null) } });
    useEffect(() => { setFocus('title'); }, [setFocus]);
    async function save(values: Values) { try {
        await onSave({ title: values.title, description: values.description || null, dueAt: toUtc(values.dueAt, item?.dueAt) });
    }
    catch (e) {
        const problem = requestError(e);
        for (const key of ['title', 'description', 'dueAt'] as const) {
            const messages = problem.fields?.[key];
            if (messages?.length)
                setError(key, { message: messages.join(' ') }, { shouldFocus: true });
        }
        setError('root', { message: problem.message });
    } }
    return <section className="form-panel" aria-labelledby="form-heading"><div className="eyebrow">MAKE ROOM FOR WHAT MATTERS</div><h2 id="form-heading">{item ? 'Edit task' : 'A fresh intention.'}</h2><p className="muted">{item ? 'Update the details. Keep moving forward.' : 'Give your task a name. The rest can wait.'}</p><form noValidate onSubmit={handleSubmit(save)} aria-busy={isSubmitting}>
 <div className="field"><label htmlFor="title">Title</label><input id="title" {...register('title')} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : 'title-hint'} placeholder="What would you like to do?"/>{errors.title && <p id="title-error" className="field-error" role="alert">{errors.title.message}</p>}<span id="title-hint" className="hint">A little clarity goes a long way. Up to 120 characters.</span></div>
 <div className="field"><label htmlFor="description">Description <span className="optional">Optional</span></label><textarea id="description" {...register('description')} rows={4} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} placeholder="Add a few helpful details…"/>{errors.description && <p id="description-error" className="field-error" role="alert">{errors.description.message}</p>}</div>
 <div className="field"><label htmlFor="dueAt">Due date <span className="optional">Optional · your local time</span></label><input id="dueAt" type="datetime-local" {...register('dueAt')} aria-invalid={!!errors.dueAt} aria-describedby={errors.dueAt ? 'dueAt-error' : undefined}/>{errors.dueAt && <p id="dueAt-error" className="field-error" role="alert">{errors.dueAt.message}</p>}</div>
 {errors.root && <p className="error-banner" role="alert">{errors.root.message}</p>}
 <div className="form-actions"><button className="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save task'}</button><button type="button" className="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button></div>
 </form></section>;
}
