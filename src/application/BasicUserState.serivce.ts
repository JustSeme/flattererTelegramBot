import { SendMessageOptions } from "node-telegram-bot-api"
import { BUTTONS_DATA, RESPONSE_ERRORS, RESPONSE_TEXTS } from "../constants"
import { BasicUserStateRepository } from "../infrastructure/basicUserState.repository"
import { BasicUserStateType } from "../types/UserStateType"

export const BasicUserStateService = {
    async findOrCreateBasicUserState(chatId: number, userStateInputModel: BasicUserStateType) {
        const userState = await BasicUserStateRepository.findBasicUserState(chatId)

        if(!userState) {
            const userStateId = await BasicUserStateRepository.createBasicUserState(userStateInputModel)

            return BasicUserStateRepository.findBasicUserStateById(userStateId)
        }

        return userState
    },

    async confirmFirstName(chatId: number) {
        const name = await BasicUserStateRepository.getUserName(chatId)

        const ConfirmFirstNameOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.SELECT_MALE_SEX_TXT, callback_data: BUTTONS_DATA.SELECT_MALE_SEX_CMD },
                    { text: BUTTONS_DATA.SELECT_FEMALE_SEX_TXT, callback_data: BUTTONS_DATA.SELECT_FEMALE_SEX_CMD }],
                    [{ text: BUTTONS_DATA.SELECT_OTHER_SEX_TXT, callback_data: BUTTONS_DATA.SELECT_OTHER_SEX_CMD }]
                ]
            }
        }

        return {
            responseText: RESPONSE_TEXTS.CONFIRM_NAME(name),
            options: ConfirmFirstNameOptions
        }
    },

    async rejectName(chatId: number) {
        const isCleared = await BasicUserStateRepository.clearName(chatId)
        
        if(!isCleared) {
            return {
                responseText: RESPONSE_ERRORS.SOMETHING_WRONG
            }
        }

        return {
            responseText: RESPONSE_TEXTS.REJECT_NAME
        }
    }
}