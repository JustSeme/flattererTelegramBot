import { SendMessageOptions } from "node-telegram-bot-api"
import { CommandsService } from "../application/commands.service"
import { bot, calendar } from "../main"
import { BUTTONS_DATA } from "../constants"
import { UserStateRepository } from "../infrastructure/userState.repository"

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
            await UserStateRepository.deleteAllUserStates(chatId)

            return bot.sendMessage(chatId, 'kek')
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