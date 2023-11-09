import { SendMessageOptions } from "node-telegram-bot-api"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { BasicUserStateType, TodoUserStateType } from "../types/UserStateType"
import { StateType } from "../types/UserStateType"
import { BUTTONS_DATA } from "../constants"
import { ObjectId } from "mongodb"

export const UserStateService = {
    async deleteUserState(chatId: number, StateType: StateType) {
        return UserStateRepository.deleteUserState(chatId, StateType)
    },

    async findUserState(chatId: number) {
        return UserStateRepository.findUserState(chatId)
    },
    
    async findOrCreateTodoUserState(chatId: number, stateType: StateType, todoId: string = null) {
        const userState = await UserStateRepository.findTodoUserState(chatId, stateType, todoId)

        if(!userState) {
            const userStateInputModel: TodoUserStateType = {
                chatId,
                stateType,
                todoId,
                todoText: null
            }

            const userStateId = await UserStateRepository.createTodoUserState(userStateInputModel)

            return UserStateRepository.findUserStateById(userStateId)
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
            StateType: 'create_todo'
        }
    },

    async updateStateMsgId(chatId: number, StateType: StateType, messageId: number) {
        return UserStateRepository.updateCreateTodoStateMsg(chatId, StateType, messageId)
    }
}