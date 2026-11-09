import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useController, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTodoSchema } from '../../../shared/schemas/todo.schema.js';
import type { CreateTodo, Todo } from '../../../shared/types/todo.js';
import { dueFromInstant, emptyDue, dueErrors, refreshDue } from '../../utils/datetime.js';
import { DueDateFields } from './DueDateFields.js';
import { requestError } from '../../services/http.js';
const dueDraftSchema = z.object({date:z.string(),hour:z.string(),minute:z.string(),instant:z.string().nullable(),retained:z.boolean(),zone:z.string(),review:z.boolean()}).superRefine((draft, context) => {
    for (const [field, message] of Object.entries(dueErrors(draft, Date.now()))) {
        context.addIssue({code:'custom',path:[field],message});
    }
});
const formSchema = z.object({ title: createTodoSchema.shape.title, description: z.string().trim().max(500, 'Description must contain at most 500 characters.'), dueAt: dueDraftSchema });
type Values = z.infer<typeof formSchema>;
export function TodoForm({ item, onSave, onCancel }: {
    item?: Todo;
    onSave: (input: CreateTodo) => Promise<void>;
    onCancel: () => void;
}) {
    const [focusDue,setFocusDue] = useState<string | null>(null);
    const { register, control, handleSubmit, setError, setValue, setFocus, formState: { errors, isSubmitting, submitCount } } = useForm<Values>({ resolver: zodResolver(formSchema), defaultValues: { title: item?.title ?? '', description: item?.description ?? '', dueAt: item?.dueAt ? dueFromInstant(item.dueAt,true) : emptyDue() } });
    const { field: dueField } = useController({name:'dueAt',control});
    const changeDate = useCallback((value: typeof dueField.value) => { setValue('dueAt',value,{shouldDirty:true,shouldValidate:submitCount > 0}); }, [setValue,submitCount]);
    useEffect(() => { setFocus('title'); }, [setFocus]);
    useEffect(() => { if(!isSubmitting && focusDue) { document.getElementById(focusDue)?.focus(); setFocusDue(null); } }, [isSubmitting,focusDue]);
    async function save(values: Values) {
        try {
        await onSave({ title: values.title, description: values.description || null, dueAt: values.dueAt.instant });
    }
    catch (e) {
        const problem = requestError(e);
        for (const key of ['title', 'description', 'dueAt'] as const) {
            const messages = problem.fields?.[key];
            if (messages?.length)
                { setError(key, { message: messages.join(' ') }, { shouldFocus: key !== 'dueAt' }); if(key === 'dueAt') setFocusDue('due-date'); }
        }
        setError('root', { message: problem.message });
    } }
    function invalid(fields: FieldErrors<Values>) {
        if(fields.title || fields.description) return;
        const first = (['date','hour','minute'] as const).find(key => fields.dueAt?.[key]);
        if(first) setFocusDue(`due-${first}`);
    }
    function submit(event: React.FormEvent<HTMLFormElement>) {
        // Refresh timezone display before the resolver reads the single controlled draft.
        const refreshed = refreshDue(dueField.value);
        if(refreshed !== dueField.value) setValue('dueAt',refreshed);
        return handleSubmit(save,invalid)(event);
    }
    return <section className="form-panel" aria-labelledby="form-heading"><div className="eyebrow">MAKE ROOM FOR WHAT MATTERS</div><h2 id="form-heading">{item ? 'Edit task' : 'A fresh intention.'}</h2><p className="muted">{item ? 'Update the details. Keep moving forward.' : 'Give your task a name. The rest can wait.'}</p><form noValidate onSubmit={submit} aria-busy={isSubmitting}>
 <div className="field"><label htmlFor="title">Title</label><input id="title" {...register('title')} aria-invalid={!!errors.title} aria-errormessage={errors.title ? 'title-error' : undefined} aria-describedby={errors.title ? 'title-error' : 'title-hint'} placeholder="What would you like to do?"/>{errors.title && <p id="title-error" className="field-error" role="alert">{errors.title.message}</p>}<span id="title-hint" className="hint">A little clarity goes a long way. Up to 120 characters.</span></div>
 <div className="field"><label htmlFor="description">Description <span className="optional">Optional</span></label><textarea id="description" {...register('description')} rows={4} aria-invalid={!!errors.description} aria-errormessage={errors.description ? 'description-error' : undefined} aria-describedby={errors.description ? 'description-error' : undefined} placeholder="Add a few helpful details…"/>{errors.description && <p id="description-error" className="field-error" role="alert">{errors.description.message}</p>}</div>
 <DueDateFields value={dueField.value} onChange={changeDate} original={item?.dueAt ?? null} submitted={submitCount > 0} fieldErrors={{date:errors.dueAt?.date?.message,hour:errors.dueAt?.hour?.message,minute:errors.dueAt?.minute?.message}} error={errors.dueAt?.message} disabled={isSubmitting}/>
 {errors.root && <p className="error-banner" role="alert">{errors.root.message}</p>}
 <div className="form-actions"><button className="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save task'}</button><button type="button" className="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button></div>
 </form></section>;
}
