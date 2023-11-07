import { TodosCollection } from "./db"

export const TodosQueryRepository = {
    async getTodosCountByUser(chatId: number) {
        return TodosCollection.countDocuments({ chatId })
    },

    async getTodosForNotify() {
        const date = new Date()
        return TodosCollection.find({ todoDate: { $lt: date }, hourForNotify: { $lt: date.getHours() }, completed: false }).toArray()
    }
}