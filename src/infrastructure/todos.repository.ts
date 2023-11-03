import { TodoType } from "../types/TodoType"
import { TodosCollection } from "./db"

export const TodosRepository = {
    async createTodo(todo: TodoType) {
        try {
            return TodosCollection.insertOne(todo)
        } catch (err) {
            console.error(err)
            return null
        }
    }
}
