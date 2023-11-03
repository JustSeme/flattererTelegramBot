import { TodoType } from "../types/TodoType"
import { TodosCollection } from "./db"

export const TodosRepository = {
    async createTodo(todo: TodoType) {
        try {
            await TodosCollection.insertOne(todo)
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}
