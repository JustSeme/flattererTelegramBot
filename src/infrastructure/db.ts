import { MongoClient } from 'mongodb'

let mongoURI = process.env.MONGO_URI

const client = new MongoClient(mongoURI)

const complimentsBotDB = client.db('complimentsBot')

export const ComplimentsCollection = complimentsBotDB.collection<{
    id: number,
    complimentText: string
}>('compliments')

export const TodosCollection = complimentsBotDB.collection<{
    userId: number,
    chatId: number,
    firstName: string,
    todoText: string,
    completed: boolean,
    todoDate: Date,
    todoTime: string
}>('todos')

export async function runDB() {
    try {
        await client.connect();
        await client.db("complimentsBot").command({ ping: 1 });
        console.log("Connected successfully to MongoDB server");
    } catch (err) {
        await client.close();
        console.log(err);
    }
}