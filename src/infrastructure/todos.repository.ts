import { TodoType } from "../types/TodoType"
import { TodosCollection } from "./db"
import { ObjectId } from "mongodb"

export const TodosRepository = {
    async createTodo(todo: TodoType) {
        try {
            return TodosCollection.insertOne(todo)
        } catch (err) {
            console.error(err)
            return null
        }
    },

    async deleteAllTodos(chatId: number): Promise<number> {
        try {
            const deleteResult = await TodosCollection.deleteMany({ chatId })
            return deleteResult.deletedCount
        } catch (err) {
            console.error(err)
            return -1
        }
    },

    async getTodosByUser(chatId: number) {
        return TodosCollection.find({ chatId }).toArray()
    },

    async getTodoById(todoId: string) {
        const _id = new ObjectId(todoId)
        return TodosCollection.findOne({ _id })
    },
}
