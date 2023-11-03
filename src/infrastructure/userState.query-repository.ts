import { UserStateCollection } from "./db"

export const UserStateQueryRepository = {
    async getUserState(userId: number) {
        return UserStateCollection.findOne({ userId })
    },
}