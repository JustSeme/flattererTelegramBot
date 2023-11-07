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

    async changeCompleted(todoId: string, completed: boolean) {
        try {
            const _id = new ObjectId(todoId)

            const result = await TodosCollection.updateOne({ _id }, { $set: { completed } })
            return result.matchedCount === 1
        } catch (err) {
            console.error(err)
            return false
        }
    },

    async changeTodoText(todoId: string, newText: string) {
        try {
            const _id = new ObjectId(todoId)
            const result = await TodosCollection.updateOne({ _id }, { $set: { todoText: newText } })
            return result.modifiedCount === 1
        } catch (err) {
            console.error(err)
            return false
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
