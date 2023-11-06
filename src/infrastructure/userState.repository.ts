import { UserStateCollection } from "./db"
import { UserStateType } from "../types/UserStateType"
import { ObjectId } from "mongodb"
import { MessageThreadType } from "../types/UserStateType"

export const UserStateRepository = {
    async createUserState(userState: UserStateType) {
        try {
            const result = await UserStateCollection.insertOne(userState)
            return result.insertedId
        } catch (err) {
            console.error(err)
            return null
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
                { chatId: userState.chatId },
                { $set: { 'todoText': userState.todoText, 'todoDate': userState.todoDate, 'todoTime': userState.todoTime } 
            })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    findUserState(chatId: number, messageThread: MessageThreadType) {
        return UserStateCollection.findOne({ chatId, messageThread })
    },

    findUserStateById(userStateId: ObjectId) {
        return UserStateCollection.findOne({ _id: userStateId })
    }
}
