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

    async deleteUserState(chatId: number, messageThread: MessageThreadType) {
        try {
            await UserStateCollection.deleteMany({ chatId, messageThread })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    async updateStateTodoText(stateId: string | ObjectId, todoText: string) {
        try {
            const _id = new ObjectId(stateId)

            await UserStateCollection.updateOne(
                { _id },
                { $set: { todoText} 
            })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    findUserStateByThread(chatId: number, messageThread: MessageThreadType, todoId: string) {
        const filterObj: any = {
            chatId,
            messageThread,
        }
        
        if(messageThread === 'change_todo_text') {
            filterObj.todoId = todoId
        }

        return UserStateCollection.findOne(filterObj)
    },

    async deleteAllUserStates(chatId: number) {
        await UserStateCollection.deleteMany({ chatId })
    },

    findUserState(chatId: number) {
        return UserStateCollection.findOne({ chatId })
    },

    findUserStateByThreadById(userStateId: ObjectId) {
        return UserStateCollection.findOne({ _id: userStateId })
    }
}
