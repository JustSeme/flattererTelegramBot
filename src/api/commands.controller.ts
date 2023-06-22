import { botService } from "../application/bot.service"
import { bot } from "../createBot"
import { getTimeOfDay } from "../helpers"

export const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию' },
        { command: '/complimet', description: 'Получить случайный комплиент' },
        { command: '/register', description: 'Подписаться на рассылку комплиментов' },
    ])

    bot.on('message', async (msg, match) => {
        const chatId = msg.chat.id
        const recivedText = msg.text

        if (recivedText === '/start') {
            const responseData = botService.start()

            await bot.sendSticker(chatId, responseData.stickerURL)
            return bot.sendMessage(chatId, responseData.responseText)
        }

        if (recivedText === '/info') {
            const responseData = botService.info(msg.date, msg.chat.username)
            return bot.sendMessage(chatId, responseData.responseText)
        }

        return bot.sendMessage(chatId, 'Мило, что ты написала, но я тебя не понимаю!)')
    })
}