import { BasicUserStateService } from "../application/BasicUserState.serivce"

export const processUpdate = async (msg, handler: HandlerType) => {
    msg.basicUserState = await BasicUserStateService.findActualUserState(msg.from.id)

    const chatId = msg.from.id

    handler(msg, chatId)
}

export type HandlerType = (msg: any, chatId: number) => void