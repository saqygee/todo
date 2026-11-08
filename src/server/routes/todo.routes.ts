import { Router } from "express";
import type { TodoService } from "../services/todo.service.js";
import { createTodoController } from "../controllers/todo.controller.js";
export function todoRoutes(service: TodoService) {
    const router = Router();
    const controller = createTodoController(service);
    router.get("/", controller.list);
    router.get("/:id", controller.get);
    router.post("/", controller.create);
    router.patch("/:id/completion", controller.complete);
    router.patch("/:id", controller.update);
    router.delete("/:id", controller.remove);
    return router;
}
