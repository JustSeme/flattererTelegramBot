import { CommandsService } from "../application/commands.service"
import { bot, calendar } from "../main"
import { UserStateRepository } from "../infrastructure/userState.repository"

export async function messagesController(msg, match) {
    const chatId = msg.chat.id
    const recivedText = msg.text
    let responseData

    switch(recivedText) {
        case '/start':
            responseData = await CommandsService.start(chatId, msg.from.first_name)

            await bot.sendSticker(chatId, responseData.stickerURL)
            return bot.send(chatId, responseData.responseText, responseData.options)
        case '/info': 
            responseData = CommandsService.info(msg.chat.username)

            return bot.send(chatId, responseData.responseText)
        case '/compliment':
            responseData = await CommandsService.getCompliment()

            return bot.send(chatId, responseData.responseText)
        case '/todo':
            responseData = await CommandsService.todoCommand(chatId)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case '/bug':
            responseData = CommandsService.bug()

            return bot.send(chatId, responseData.responseText)
        // for test
        case '/del-thread':
            await UserStateRepository.deleteAllUserStates(chatId)

            return bot.send(chatId, 'kek')
        default:
            responseData = await CommandsService.defaultCommand(chatId, recivedText)

            let sendMessageResult = null
            if(responseData.responseText) {
                sendMessageResult = await bot.send(chatId, responseData.responseText, responseData.options)
            }

            // TODO_update_msg_id
            switch(responseData.StateType) {
                case('create_todo'):
                    calendar.startNavCalendar(msg)
                default:
                    return
            }
    }
}