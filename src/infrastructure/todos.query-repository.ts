import { TodosCollection } from "./db"
import { ObjectId } from "mongodb"

export const TodosQueryRepository = {
    async getTodosByUserId(userId: number) {
        return TodosCollection.find({ userId }).toArray()
    },

    async getTodoById(todoId: string) {
        const _id = new ObjectId(todoId)
        return TodosCollection.findOne({ _id })
    },

    async getTodosCountByUserId(userId: number) {
        return TodosCollection.countDocuments({ userId })
    }
}