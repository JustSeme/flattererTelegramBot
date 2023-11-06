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
    },

    async deleteAllTodos(userId: number): Promise<number> {
        try {
            const deleteResult = await TodosCollection.deleteMany({ userId })
            return deleteResult.deletedCount
        } catch (err) {
            console.error(err)
            return -1
        }
    },

    async getTodosByUser(userId: number) {
        return TodosCollection.find({ userId }).toArray()
    },
}
