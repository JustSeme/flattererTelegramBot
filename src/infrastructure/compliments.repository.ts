import { genRandomInt } from "../helpers"
import { ComplimentsCollection } from "./db"

export const ComplimentsRepository = {
    async getRandomCompliment(): Promise<{ responseText: string }> {
        const complimentsCount = await ComplimentsCollection.countDocuments({})
        const randomId = genRandomInt(0, complimentsCount)
        const randomCompliment = await ComplimentsCollection.findOne({ id: randomId })
        return { responseText: randomCompliment.complimentText }
    }
}
