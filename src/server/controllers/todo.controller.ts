import type { RequestHandler } from "express";
import type { TodoService } from "../services/todo.service.js";
import {
  createTodoSchema,
  listQuerySchema,
  idSchema,
  completionSchema,
  updateTodoSchema,
} from "../../shared/schemas/todo.schema.js";
export function createTodoController(service: TodoService) {
  const list: RequestHandler = async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    res.json({ data: await service.list(query.includeCompleted) });
  };
  const get: RequestHandler = async (req, res) => {
    res.json({ data: await service.get(idSchema.parse(req.params.id)) });
  };
  const create: RequestHandler = async (req, res) => {
    const item = await service.create(createTodoSchema.parse(req.body));
    res
      .location("/api/todos/" + item.id)
      .status(201)
      .json({ data: item });
  };
  const complete: RequestHandler = async (req, res) => {
    const { completed } = completionSchema.parse(req.body);
    res.json({
      data: await service.complete(idSchema.parse(req.params.id), completed),
    });
  };
  const update: RequestHandler = async (req, res) => {
    res.json({
      data: await service.update(
        idSchema.parse(req.params.id),
        updateTodoSchema.parse(req.body),
      ),
    });
  };
  const remove: RequestHandler = async (req, res) => {
    await service.remove(idSchema.parse(req.params.id));
    res.status(204).end();
  };
  return { list, get, create, complete, update, remove };
}
