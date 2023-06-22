require('dotenv').config()
import { start } from "./api/commands.controller";
import { runDB } from "./infrastructure/db";
import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN
export const bot = new TelegramBot(token, { polling: true })


module.exports = async (request, response) => {
    await runDB()
    await start()
    response.json({
        body: request.body,
        query: request.query,
        cookies: request.cookies,
    });
};