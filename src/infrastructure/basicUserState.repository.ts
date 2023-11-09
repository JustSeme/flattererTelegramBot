import { BasicUserStateCollection } from "./db"
import { ObjectId } from "mongodb"
import { BasicUserStateType } from "../types/UserStateType"

export const BasicUserStateRepository = {
    async createBasicUserState(userState: BasicUserStateType) {
        try {
            const result = await BasicUserStateCollection.insertOne(userState)
            return result.insertedId
        } catch (err) {
            console.error(err)
            return null
        }
    },

    findBasicUserState(chatId: number) {
        return BasicUserStateCollection.findOne({ chatId })
    },

    findBasicUserStateById(_id: ObjectId) {
        return BasicUserStateCollection.findOne({ _id })
    },

    async clearName(chatId: number) {
        try {
            await BasicUserStateCollection.updateOne({ chatId }, { $set: { name: null } })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    async getUserName(chatId: number) {
        const basicUserState = await BasicUserStateCollection.findOne({ chatId })

        return basicUserState.name
    },

    async updateLang(chatId: number, language: 'ru' | 'en') {
        try {
            await BasicUserStateCollection.updateOne({ chatId }, { $set: { language } })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    async updateSex(chatId: number, sex: string) {
        try {
            const updateResult = await BasicUserStateCollection.updateOne({ chatId }, { $set: { sex } })
            return updateResult.matchedCount === 1
        } catch (err) {
            console.error(err)
            return false
        }
    }
}