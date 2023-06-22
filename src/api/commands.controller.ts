import { BotService } from "../application/bot.service"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"
import { UserContactsInfo } from "../infrastructure/userContactsInfoType"
import { bot } from "../main"

export const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию' },
        { command: '/compliment', description: 'Получить случайный комплиент' },
        { command: '/register', description: 'Подписаться на рассылку комплиментов' },
    ])

    bot.on('message', async (msg, match) => {
        const chatId = msg.chat.id
        const recivedText = msg.text

        if (recivedText === '/start') {
            const responseData = BotService.start()

            await bot.sendSticker(chatId, responseData.stickerURL)
            return bot.sendMessage(chatId, responseData.responseText)
        }

        console.log(msg);

        console.log(match);

        if (recivedText === '/info') {
            const responseData = BotService.info(msg.date, msg.chat.username)
            return bot.sendMessage(chatId, responseData.responseText)
        }

        if (recivedText === '/compliment') {
            const responseData = await BotService.getCompliment()
            return bot.sendMessage(chatId, responseData.responseText)
        }

        if (recivedText === '/register') {
            return bot.sendMessage(chatId, 'Я позже это сделаю')
        }

        if (recivedText === '/set-user-contacts-info') {
            const userContactsInfo: UserContactsInfo = {
                chatId: msg.chat.id,
                first_name: msg.from.first_name,
                userId: msg.from.id
            }
            return ComplimentsRepository.addUserContactInfo(userContactsInfo)
        }

        if (recivedText === '/get-user-contacts-info') {
            const userContactsData = await ComplimentsRepository.getAllUserContactsInfo()
            const userJSONData = JSON.stringify(userContactsData)
            return userJSONData
        }

        return bot.sendMessage(chatId, 'Мило, что ты написала, но я тебя не понимаю!)')
    })
}