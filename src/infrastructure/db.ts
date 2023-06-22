import { MongoClient } from 'mongodb'

let mongoURI = process.env.MONGO_URI

const client = new MongoClient(mongoURI)

const complimentsBotDB = client.db('complimentsBot')

export const complimentsCollection = complimentsBotDB.collection<{ id: number, complimentText: string }>('compliments')

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