import { UserStateCollection } from "./db"
import { UserStateType } from "../types/UserStateType"

export const UserStateRepository = {
    async getUserState(userId: number) {
        return UserStateCollection.findOne({ userId })
    },

    async createUserState(userState: UserStateType) {
        try {
            await UserStateCollection.insertOne(userState)
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    async deleteUserState(userId: number) {
        try {
            await UserStateCollection.deleteOne({ userId })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}
