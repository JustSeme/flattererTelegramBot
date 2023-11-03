import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoType } from "../types/TodoType"

export const TodoService = {
    async createTodo(todo: TodoType) {
        return TodosRepository.createTodo(todo)
    },
}