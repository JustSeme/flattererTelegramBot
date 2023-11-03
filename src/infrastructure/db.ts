import { MongoClient } from 'mongodb'
import { TodoType } from '../types/TodoType'
import { UserStateType } from '../types/UserStateType'
import { ComplimentType } from '../types/ComplimentType'

let mongoURI = process.env.MONGO_URI

const client = new MongoClient(mongoURI)

const complimentsBotDB = client.db('complimentsBot')

export const ComplimentsCollection = complimentsBotDB.collection<ComplimentType>('compliments')

export const UserStateCollection = complimentsBotDB.collection<UserStateType>('userState')

export const TodosCollection = complimentsBotDB.collection<TodoType>('todos')

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