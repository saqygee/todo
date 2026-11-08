import { useCallback, useEffect, useRef, useState } from 'react';
import type { Todo } from '../../shared/types/todo.js';
import { todoApi } from '../services/todo-api.js';
import { requestError } from '../services/http.js';
export function useTodos(includeCompleted: boolean) {
    const [items, setItems] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const generation = useRef(0);
    const refresh = useCallback(() => setRevision(v => v + 1), []);
    useEffect(() => {
        const current = ++generation.current;
        const controller = new AbortController();
        setLoading(true);
        setError('');
        void todoApi.list(includeCompleted, controller.signal).then(data => { if (current === generation.current && !controller.signal.aborted)
            setItems(data); }).catch(e => { if (current === generation.current && !controller.signal.aborted)
            setError(requestError(e).message); }).finally(() => { if (current === generation.current && !controller.signal.aborted)
            setLoading(false); });
        return () => { controller.abort(); };
    }, [includeCompleted, revision]);
    return { items, loading, error, refresh };
}
