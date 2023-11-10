import { BasicUserStateService } from "../application/BasicUserState.serivce"
import { UserStateRepository } from "../infrastructure/userState.repository"

export const processUpdate = async (msg, handler: HandlerType) => {
    msg.basicUserState = await BasicUserStateService.findUserState(msg.from.id)

    const chatId = msg.from.id
    const recivedText = msg.text
    const username = msg.userState.name || msg.from.first_name
    
    const actualUserState = await UserStateRepository.findUserState(chatId)


    handler(msg, chatId, username, recivedText)
}

export type HandlerType = (msg: any, chatId: number, username: string, recivedText: string) => void