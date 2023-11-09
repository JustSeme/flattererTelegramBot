import { UserStateCollection } from "./db"
import { TodoUserStateType, StateType} from "../types/UserStateType"
import { ObjectId } from "mongodb"

export const UserStateRepository = {
    async createTodoUserState(userState: TodoUserStateType) {
        try {
            const result = await UserStateCollection.insertOne(userState)
            return result.insertedId
        } catch (err) {
            console.error(err)
            return null
        }
    },

    async deleteUserState(chatId: number, StateType: StateType) {
        try {
            await UserStateCollection.deleteMany({ chatId, StateType })
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

    async updateCreateTodoStateMsg(chatId: number, stateType: StateType, messageId: number) {
        try {
            await UserStateCollection.updateOne(
                { chatId, stateType },
                { $set: { botMsgId: messageId } 
            })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    findTodoUserState(chatId: number, stateType: StateType, todoId?: string) {
        const filterObj: any = {
            chatId,
            stateType,
        }
        
        if(stateType === 'change_todo_text' && todoId) {
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

    findUserStateById(userStateId: ObjectId) {
        return UserStateCollection.findOne({ _id: userStateId })
    },
}
