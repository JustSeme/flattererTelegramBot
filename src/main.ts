require('dotenv').config()
import { start } from "./api/commands.controller";
import { runDB } from "./infrastructure/db";
import Calendar from 'telegram-inline-calendar'
import TelegramBot from "node-telegram-bot-api";
import { TodosQueryRepository } from "./infrastructure/todos.query-repository";

const token = process.env.TELEGRAM_BOT_TOKEN
export const bot = new TelegramBot(token, { polling: true })

export const calendar = new Calendar(bot, {
    date_format: 'DD.MM.YYYY/HH',
    language: 'ru',
    start_date: new Date(),
    time_selector_mod: true,
    time_step: '1h',
});

runDB()
start()


setInterval(async () => {
    const todosForNotify = await TodosQueryRepository.getTodosForNotify()

    for(const todo of todosForNotify) {
        const notifyText = `Счастлив уведомить вас, ${todo.firstName}, что пришло время выполнить задачу ${todo.todoText}!\n`
        await bot.sendMessage(todo.chatId, notifyText)
    }
}, 3600000) // ever hour