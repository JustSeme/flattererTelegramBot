import { UserStateRepository } from "../infrastructure/userState.repository"
import { UserStateType } from "../types/UserStateType"

export const UserStateService = {
    async createUserState(userState: UserStateType) {
        return UserStateRepository.createUserState(userState)
    },

    async deleteUserState(userId: number) {
        return UserStateRepository.deleteUserState(userId)
    },

    async updateUserState(userState: UserStateType) {
        return UserStateRepository.updateUserState(userState)
    }
}