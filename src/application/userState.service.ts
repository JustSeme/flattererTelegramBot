import { SendMessageOptions } from "node-telegram-bot-api"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { BasicUserStateType, TodoUserStateType } from "../types/UserStateType"
import { StateType } from "../types/UserStateType"
import { BUTTONS_DATA, RESPONSE_TEXTS, RESPONSE_WARNS } from "../constants"
import { ObjectId } from "mongodb"
import { bot, calendar } from "../main"

export const UserStateService = {
    async deleteUserState(chatId: number, stateType: StateType) {
        return UserStateRepository.deleteUserState(chatId, stateType)
    },

    async deleteCreateTodoState(msg: any, chatId: number) {
        return UserStateRepository.deleteUserState(chatId, 'create_todo')
    },

    async findActualUserState(chatId: number) {
        return UserStateRepository.findActualUserState(chatId)
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

    async setStandardTodoText(msg: any, chatId: number) {
        const actualUserState = await UserStateRepository.findActualUserState(chatId)

        // here will be get standard user text
        const standardText = 'Сделать возможность изменять стандартный текст для пользователя'

        await UserStateRepository.updateStateTodoText(actualUserState._id, standardText)

        const setStandardTodoTextOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.DELETE_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.DELETE_TODO_TEXT_CMD }]
                ]
            }
        }

        const responseText = RESPONSE_TEXTS.STANDARD_TEXT_SETTED(standardText) 

        await bot.send(chatId, responseText)
        return calendar.startNavCalendar(msg.message)
    },

    async updateStateMsgId(chatId: number, StateType: StateType, messageId: number) {
        return UserStateRepository.updateCreateTodoStateMsg(chatId, StateType, messageId)
    }
}