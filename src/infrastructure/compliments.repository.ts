import { genRandomInt } from "../helpers"
import { complimentsCollection } from "./db"

export const ComplimentsRepository = {
    async getRandomCompliment(): Promise<{ responseText: string }> {
        const complimentsCount = await complimentsCollection.countDocuments({})
        const randomId = genRandomInt(0, complimentsCount)
        const randomCompliment = await complimentsCollection.findOne({ id: randomId })
        return { responseText: randomCompliment.complimentText }
    }
}

