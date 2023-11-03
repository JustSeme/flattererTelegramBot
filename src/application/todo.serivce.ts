import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoType } from "../types/TodoType"

export const TodoService = {
    async createTodo(todo: TodoType) {
        return TodosRepository.createTodo(todo)
    },

    deleteAllTodos(userId: number): Promise<number> {
        return TodosRepository.deleteAllTodos(userId)
    }
}