import { CommandsService } from "../application/commands.service"
import { bot, calendar } from "../main"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { HandlerType, processUpdate } from "../middlewares/processUpdate.middleware"

export async function messagesController(msg) {
    const chatId = msg.chat.id
    const recivedText = msg.text
    let handler: HandlerType
    let responseData

    switch(recivedText) {
        case '/start':
            handler = CommandsService.start
            break;
        case '/info': 
            handler = CommandsService.info
            break;
        case '/compliment':
            handler = CommandsService.getCompliment

            break;
        case '/todo':
            handler = CommandsService.todoCommand

            break;
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
    await processUpdate(msg, handler)
}