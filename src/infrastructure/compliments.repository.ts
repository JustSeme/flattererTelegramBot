import { complimentsCollection } from "./db"

export const ComplimentsRepository = {
    async getRandomCompliment(): Promise<{ responseText: string }> {
        const complimentData = complimentsCollection.countDocuments({})
        console.log(complimentData);
        return { responseText: 's' }
    }
}