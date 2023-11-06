import { UserStateCollection } from "./db"

export const UserStateQueryRepository = {
    async getUserState(chatId: number) {
        return UserStateCollection.findOne({ chatId })
    },
}