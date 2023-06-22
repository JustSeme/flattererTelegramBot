require('dotenv').config()
import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN

const bot = new TelegramBot(token, { polling: true })

bot.on('message', async (msg, match) => {

    const chatId = msg.chat.id
    const recivedText = msg.text

    if (recivedText === '/start') {
        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/364/159/364159a8-d72f-4a04-8aa1-3272dd144b06/4.webp')
        await bot.sendMessage(chatId, 'Привет, я самый льстивый бот в телеграме. Если хочешь получать от меня регулярные комплименты - подпишись на рассылку командой /register')
    }

    if (recivedText === '/info') {
        const timeOfDay = getTimeOfDay(msg.date)
        await bot.sendMessage(chatId, `Сейчас ${timeOfDay} и тебя по прежнему зовут ${msg.chat.username}!`)
    }
})

function getTimeOfDay(date: number): string {
    const currentHour = new Date(date).getHours()
    if (currentHour >= 0 && currentHour <= 6) {
        return 'ночь'
    } else if (currentHour >= 6 && currentHour <= 12) {
        return 'утро'
    } else if (currentHour >= 12 && currentHour <= 18) {
        return 'день'
    } else if (currentHour >= 18 && currentHour <= 0) {
        return 'вечер'
    }
}