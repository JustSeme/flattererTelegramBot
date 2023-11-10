import { CommandsService } from "../application/commands.service"
import { bot } from "../main"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { HandlerType, processUpdate } from "../middlewares/processUpdate.middleware"

export async function messagesController(msg) {
    const chatId = msg.chat.id
    const recivedText = msg.text
    let handler: HandlerType

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
            handler = CommandsService.bug
            break;
        // for test
        case '/del-thread':
            await UserStateRepository.deleteAllUserStates(chatId)

            return bot.send(chatId, 'kek')
        default:
            handler = CommandsService.defaultCommand
            break;
        }
    await processUpdate(msg, handler)
}