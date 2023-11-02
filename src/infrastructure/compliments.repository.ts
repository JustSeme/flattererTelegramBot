import { genRandomInt } from "../helpers"
import { ComplimentsCollection, UserContactsInfoCollection } from "./db"
import { UserContactsInfo } from "./userContactsInfoType"

export const ComplimentsRepository = {
    async getRandomCompliment(): Promise<{ responseText: string }> {
        const complimentsCount = await ComplimentsCollection.countDocuments({})
        const randomId = genRandomInt(0, complimentsCount)
        const randomCompliment = await ComplimentsCollection.findOne({ id: randomId })
        return { responseText: randomCompliment.complimentText }
    },

    async addUserContactInfo(UserContactsInfo: UserContactsInfo) {
        /* await UserContactsInfoCollection.insertOne({
            'chatId': UserContactsInfo.chatId,
            'first_name': UserContactsInfo.first_name,
            'userId': UserContactsInfo.userId
        }) */
    },

    async getAllUserContactsInfo() {
        const result = await UserContactsInfoCollection.findOne({chatId: 789878593})
        return result
    }
}

