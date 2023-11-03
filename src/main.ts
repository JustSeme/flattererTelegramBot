require('dotenv').config()
import { start } from "./api/commands.controller";
import { runDB } from "./infrastructure/db";
import Calendar from 'telegram-inline-calendar'
import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN
export const bot = new TelegramBot(token, { polling: true })

export const calendar = new Calendar(bot, {
    date_format: 'DD.MM.YYYY/HH:mm',
    language: 'ru',
    start_date: new Date(),
    time_selector_mod: true,
    time_step: '1h',
});

runDB()
start()


/* setInterval(async() => {
    return bot.sendMessage(789878593, 'Рад, что ты меня разрабатываешь))')
}, 60000) */