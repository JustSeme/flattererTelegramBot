import { UserStateRepository } from "../infrastructure/userState.repository"
import { UserStateType } from "../types/UserStateType"
import { MessageThreadType } from "../types/UserStateType"

export const UserStateService = {
    async deleteUserState(userId: number) {
        return UserStateRepository.deleteUserState(userId)
    },

    async updateUserState(userState: UserStateType) {
        return UserStateRepository.updateUserState(userState)
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
    }
}