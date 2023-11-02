import { TodoType } from "./TodoType"
import { TodosCollection } from "./db"

export const ComplimentsRepository = {
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
