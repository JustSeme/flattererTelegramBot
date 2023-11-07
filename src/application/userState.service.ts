import { UserStateRepository } from "../infrastructure/userState.repository"
import { UserStateType } from "../types/UserStateType"
import { MessageThreadType } from "../types/UserStateType"

export const UserStateService = {
    async deleteUserState(chatId: number) {
        return UserStateRepository.deleteUserState(chatId)
    },
    
    async findOrCreateUserState(chatId: number, messageThread: MessageThreadType) {
        const userState = await UserStateRepository.findUserState(chatId, messageThread)

        if(!userState) {
            const userStateInputModel: UserStateType = {
                chatId,
                todoText: null,
                todoDate: null,
                todoTime: null,
                messageThread
            }

            const userStateId = await UserStateRepository.createUserState(userStateInputModel)

            return UserStateRepository.findUserStateById(userStateId)
        }

        return userState
    },

    async setStandardTodoText(actualUserState: UserStateType) {
        // here will be get standard user text
        const standardText = 'Сделать возможность изменять стандартный текст для пользователя'
        actualUserState.todoText = standardText

        await UserStateRepository.updateUserState(actualUserState)

        return { responseText: `Всё ради тебя! Стандартный текст - "${standardText}" установлен. А когда нужно выполнить задачу?` }
    }
}