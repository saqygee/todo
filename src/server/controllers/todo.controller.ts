import type { RequestHandler } from "express";
import type { TodoService } from "../services/todo.service.js";
import { todoValidator } from "../validators/todo.validator.js";
export function createTodoController(service: TodoService) {
  const list: RequestHandler = async (req, res) => {
    const query = todoValidator.list(req.query);
    res.json({ data: await service.list(query.includeCompleted) });
  };
  const get: RequestHandler = async (req, res) => {
    res.json({ data: await service.get(todoValidator.id(req.params)) });
  };
  const create: RequestHandler = async (req, res) => {
    const item = await service.create(todoValidator.create(req.body));
    res
      .location("/api/todos/" + item.id)
      .status(201)
      .json({ data: item });
  };
  const complete: RequestHandler = async (req, res) => {
    const { completed } = todoValidator.completion(req.body);
    res.json({
      data: await service.complete(todoValidator.id(req.params), completed),
    });
  };
  const update: RequestHandler = async (req, res) => {
    res.json({
      data: await service.update(
        todoValidator.id(req.params),
        todoValidator.update(req.body),
      ),
    });
  };
  const remove: RequestHandler = async (req, res) => {
    await service.remove(todoValidator.id(req.params));
    res.status(204).end();
  };
  return { list, get, create, complete, update, remove };
}
