import { BotService } from "../application/bot.service"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"
import { UserContactsInfo } from "../infrastructure/userContactsInfoType"
import { bot, calendar } from "../main"

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
        let responseData

        switch(recivedText) {
            case '/start':
                await bot.setMyCommands([
                    { command: '/start', description: 'Приветствие' },
                    { command: '/info', description: 'Получить информацию' },
                    { command: '/compliment', description: 'Получить случайный комплиент' },
                    { command: '/register', description: 'Подписаться на рассылку комплиментов' },
                ])
                responseData = BotService.start()

                await bot.sendSticker(chatId, responseData.stickerURL)
                return bot.sendMessage(chatId, responseData.responseText)
            case '/info': 
                responseData = BotService.info(msg.date, msg.chat.username)
                return bot.sendMessage(chatId, responseData.responseText)
            case '/compliment':
                responseData = await BotService.getCompliment()
                return bot.sendMessage(chatId, responseData.responseText)
            case '/register':
                calendar.startNavCalendar(msg)
                return bot.sendMessage(chatId, 'Как часто ты хочешь получать комплименты?')
            case '/set-user-contacts-info':
                const userContactsInfo: UserContactsInfo = {
                    chatId: msg.chat.id,
                    first_name: msg.from.first_name,
                    userId: msg.from.id
                }
                return ComplimentsRepository.addUserContactInfo(userContactsInfo)
            default:
                return bot.sendMessage(chatId, 'Мило, что ты написала, но я тебя не понимаю!)')
        }
    })

    bot.on("callback_query", (query) => {
        if (query.message.message_id == calendar.chats.get(query.message.chat.id)) {
            const res = calendar.clickButtonCalendar(query);
            if (res !== -1) {
                // here will be insert notify action
                bot.sendMessage(query.message.chat.id, `Я счастлив как никогда! Жду не дождусь когда настанет ${res} чтобы снова написать тебе.`);
            }
        }
    });
}