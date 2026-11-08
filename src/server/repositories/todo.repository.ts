import type { Todo as TodoRecord } from "../../generated/prisma/client.js";
import type { Database } from "../config/prisma.js";
import type { CreateTodo, UpdateTodo } from "../../shared/types/todo.js";
import { AppError } from "../utils/errors.js";
export function isRetryable(error: unknown): boolean {
    if (typeof error !== "object" || error === null)
        return false;
    const code = "code" in error ? error.code : undefined;
    if (code === "P2002" ||
        code === "P2034" ||
        code === "SQLITE_BUSY" ||
        code === "SQLITE_BUSY_SNAPSHOT")
        return true;
    if ("cause" in error && error.cause !== error && isRetryable(error.cause))
        return true;
    if ("meta" in error &&
        typeof error.meta === "object" &&
        error.meta !== null &&
        "driverAdapterError" in error.meta)
        return isRetryable(error.meta.driverAdapterError);
    if ("originalCode" in error &&
        ["5", "517", "SQLITE_BUSY", "SQLITE_BUSY_SNAPSHOT"].includes(String(error.originalCode)))
        return true;
    return false;
}
export function createTodoRepository(db: Database): TodoRepository {
    let connectionReady: Promise<unknown> | undefined;
    const ready = () => connectionReady ??= db.$queryRaw `PRAGMA journal_mode = WAL`;
    return {
        async list(includeCompleted: boolean) {
            await ready();
            return db.todo.findMany({
                where: {
                    deleted: false,
                    ...(!includeCompleted && { completed: false }),
                },
                orderBy: { ordinal: "asc" },
            });
        },
        async find(id: string) {
            await ready();
            return db.todo.findFirst({ where: { id, deleted: false } });
        },
        async create(input: CreateTodo) {
            await ready();
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    return await db.$transaction(async (tx) => {
                        const max = await tx.todo.aggregate({ _max: { ordinal: true } });
                        const ordinal = (max._max.ordinal ?? -1) + 1;
                        if (ordinal > 2147483647)
                            throw new AppError(409, "ORDINAL_EXHAUSTED", "No further task order values are available.");
                        return tx.todo.create({
                            data: {
                                ...input,
                                dueAt: input.dueAt ? new Date(input.dueAt) : null,
                                ordinal,
                            },
                        });
                    }, { timeout: 5000, maxWait: 5000 });
                }
                catch (e) {
                    if (!isRetryable(e))
                        throw e;
                    if (attempt === 2)
                        throw new AppError(503, "STORAGE_BUSY", "Storage is busy. Please try again.");
                    await new Promise((resolve) => setTimeout(resolve, 15 * (attempt + 1)));
                }
            }
            throw new AppError(503, "STORAGE_BUSY", "Storage is busy. Please try again.");
        },
        async update(id: string, input: UpdateTodo) {
            await ready();
            return db.$transaction(async (tx) => {
                const data = {
                    ...input,
                    ...(input.dueAt !== undefined && {
                        dueAt: input.dueAt ? new Date(input.dueAt) : null,
                    }),
                };
                const result = await tx.todo.updateMany({
                    where: { id, deleted: false },
                    data,
                });
                return result.count
                    ? tx.todo.findFirst({ where: { id, deleted: false } })
                    : null;
            });
        },
        async complete(id: string, completed: boolean) {
            await ready();
            return db.$transaction(async (tx) => {
                const result = await tx.todo.updateMany({
                    where: { id, deleted: false },
                    data: { completed },
                });
                return result.count
                    ? tx.todo.findFirst({ where: { id, deleted: false } })
                    : null;
            });
        },
        async remove(id: string) {
            await ready();
            const result = await db.todo.updateMany({
                where: { id, deleted: false },
                data: { deleted: true },
            });
            return result.count > 0;
        },
    };
}
export interface TodoRepository {
    list(includeCompleted: boolean): Promise<TodoRecord[]>;
    find(id: string): Promise<TodoRecord | null>;
    create(input: CreateTodo): Promise<TodoRecord>;
    update(id: string, input: UpdateTodo): Promise<TodoRecord | null>;
    complete(id: string, completed: boolean): Promise<TodoRecord | null>;
    remove(id: string): Promise<boolean>;
}
