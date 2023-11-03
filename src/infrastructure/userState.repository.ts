import { UserStateCollection } from "./db"
import { UserStateType } from "../types/UserStateType"

export const UserStateRepository = {
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
            await UserStateCollection.deleteMany({ userId })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    async updateUserState(userState: UserStateType) {
        try {
            await UserStateCollection.updateOne(
                { userId: userState.userId },
                { $set: { 'todoText': userState.todoText, 'todoDate': userState.todoDate, 'todoTime': userState.todoTime } 
            })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}
