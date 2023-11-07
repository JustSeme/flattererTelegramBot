import { SendMessageOptions } from "node-telegram-bot-api"
import { CommandsService } from "../application/commands.service"
import { bot, calendar } from "../main"
import { BUTTONS_DATA } from "../constants"

export async function messagesController(msg) {
    const chatId = msg.chat.id
    const recivedText = msg.text
    let responseData

    switch(recivedText) {
        case '/start':
            responseData = CommandsService.start()

            await bot.sendSticker(chatId, responseData.stickerURL)
            return bot.sendMessage(chatId, responseData.responseText)
        case '/info': 
            responseData = CommandsService.info(msg.chat.username)

            return bot.sendMessage(chatId, responseData.responseText)
        case '/compliment':
            responseData = await CommandsService.getCompliment()

            return bot.sendMessage(chatId, responseData.responseText)
        case '/todo':
            responseData = await CommandsService.todoCommand(chatId)

            return bot.sendMessage(chatId, responseData.responseText, responseData.options)
        // for test
        case '/del-thread':
            const createTodoOptions: SendMessageOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD }],
                        [{ text: 'delete todo text', callback_data: BUTTONS_DATA.DELETE_TODO_TEXT_CMD }]
                    ]
                }
            }
            return bot.sendMessage(chatId, 'kek', createTodoOptions)
        default:
            responseData = await CommandsService.defaultCommand(chatId, recivedText)

            if(responseData.responseText) {
                await bot.sendMessage(chatId, responseData.responseText, responseData.options)
            }

            if(responseData.isShowCalendar) {
                calendar.startNavCalendar(msg)
            }
    }
}