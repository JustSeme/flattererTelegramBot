import { SendMessageOptions } from "node-telegram-bot-api"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { UserStateType } from "../types/UserStateType"
import { MessageThreadType } from "../types/UserStateType"
import { BUTTONS_DATA } from "../constants"
import { ObjectId } from "mongodb"

export const UserStateService = {
    async deleteUserState(chatId: number, messageThread: MessageThreadType) {
        return UserStateRepository.deleteUserState(chatId, messageThread)
    },

    async findUserState(chatId: number) {
        return UserStateRepository.findUserState(chatId)
    },
    
    async findOrCreateUserState(chatId: number, messageThread: MessageThreadType, todoId: string = null) {
        const userState = await UserStateRepository.findUserStateByThread(chatId, messageThread, todoId)

        if(!userState) {
            const userStateInputModel: UserStateType = {
                chatId,
                todoText: null,
                botMsgId: null,
                todoId,
                messageThread
            }

            const userStateId = await UserStateRepository.createUserState(userStateInputModel)

            return UserStateRepository.findUserStateByThreadById(userStateId)
        }

        return userState
    },

    async setStandardTodoText(stateId: string | ObjectId) {
        // here will be get standard user text
        const standardText = 'Сделать возможность изменять стандартный текст для пользователя'

        await UserStateRepository.updateStateTodoText(stateId, standardText)

        const setStandardTodoTextOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.DELETE_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.DELETE_TODO_TEXT_CMD }]
                ]
            }
        }

        return { 
            responseText: `Всё ради вас, превосходнейший! Стандартный текст - "${standardText}" установлен. А когда нужно выполнить задачу?`, 
            options: setStandardTodoTextOptions,
            messageThread: 'create_todo'
        }
    },

    async updateStateMsgId(chatId: number, messageThread: MessageThreadType, messageId: number) {
        return UserStateRepository.updateCreateTodoStateMsg(chatId, messageThread, messageId)
    }
}