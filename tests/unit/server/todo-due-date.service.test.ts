import { it, expect, vi } from "vitest";
import { createTodoService } from "../../../src/server/services/todo.service.js";
import type { TodoRepository } from "../../../src/server/repositories/todo.repository.js";
import type { Todo } from "../../../src/generated/prisma/client.js";
const now = Date.parse("2026-11-08T10:15:30Z");
const record: Todo = {
  id: "f5f24d2f-7a55-4aeb-b101-5b28d2040b82",
  title: "Task",
  description: null,
  dueAt: new Date(now - 1000),
  ordinal: 0,
  completed: false,
  deleted: false,
  createdAt: new Date(now),
  updatedAt: new Date(now),
};
it("validates at the repository callback and repeats the clock check for a retried write", async () => {
  let clock = now;
  let guard: (() => void) | undefined;
  const create = vi.fn(async (_input: unknown, beforeWrite?: () => void) => {
    guard = beforeWrite;
    beforeWrite?.();
    return record;
  });
  const repo: TodoRepository = {
    list: vi.fn(),
    find: vi.fn(),
    create,
    update: vi.fn(),
    complete: vi.fn(),
    remove: vi.fn(),
  };
  const service = createTodoService(repo, () => clock);
  await service.create({
    title: "Task",
    description: null,
    dueAt: new Date(now + 500).toISOString(),
  });
  expect(guard).toBeTypeOf("function");
  clock += 1000;
  expect(() => guard?.()).toThrow();
});
it("checks against the row supplied by the transaction, not a stale prefetch", async () => {
  const update = vi.fn(
    async (_id: string, _input: unknown, beforeWrite?: (row: Todo) => void) => {
      beforeWrite?.({ ...record, dueAt: new Date(now + 10000) });
      return record;
    },
  );
  const repo: TodoRepository = {
    list: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    update,
    complete: vi.fn(),
    remove: vi.fn(),
  };
  await expect(
    createTodoService(repo, () => now).update(record.id, {
      dueAt: record.dueAt!.toISOString(),
    }),
  ).rejects.toThrow();
  expect(repo.find).not.toHaveBeenCalled();
});
