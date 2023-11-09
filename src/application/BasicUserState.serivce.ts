import { SendMessageOptions } from "node-telegram-bot-api"
import { BUTTONS_DATA, RESPONSE_ERRORS, RESPONSE_TEXTS, RESPONSE_WARNS } from "../constants"
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

    findUserState(chatId: number) {
        return BasicUserStateRepository.findBasicUserState(chatId)
    },

    confirmFirstName(userName: string) {
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
            responseText: RESPONSE_TEXTS.CONFIRM_NAME(userName),
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
    },

    async selectLang(chatId: number, lang: 'ru' | 'en', userName: string) {
        const isUpdated = await BasicUserStateRepository.updateLang(chatId, lang)

        if(!isUpdated) {
            return { 
                responseText: RESPONSE_ERRORS.SOMETHING_WRONG
            }
        }

        const selectLangOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CONFIRM_FIRST_NAME_TXT, callback_data: BUTTONS_DATA.CONFIRM_FIRST_NAME_CMD }],
                    [{ text: BUTTONS_DATA.REJECT_FIRST_NAME_TXT, callback_data: BUTTONS_DATA.REJECT_FIRST_NAME_CMD }]
                ]
            }
        }

        if(!userName) {
            return {
                responseText: lang === 'ru' ? RESPONSE_WARNS.SELECT_RU_LANG_WITHOUT_NAME : RESPONSE_WARNS.SELECT_EN_LANG_WITHOUT_NAME
            }
        }

        return {
            responseText: lang === 'ru' ? RESPONSE_TEXTS.SELECT_RU_LANG(userName) : RESPONSE_TEXTS.SELECT_EN_LANG(userName),
            options: selectLangOptions
        }
    },

    async selectSex(chatId: number, sex: 'male' | 'female' | 'other') {
        const userName = await BasicUserStateRepository.getUserName(chatId)

        if(sex === 'other') {
            return {
                responseText: RESPONSE_TEXTS.SELECT_OTHER_SEX(userName)
            }
        }

        const isUpdated = await BasicUserStateRepository.updateSex(chatId, sex)

        if(!isUpdated) {
            return { 
                responseText: RESPONSE_ERRORS.SOMETHING_WRONG
            }
        }

        return {
            responseText: sex === 'male' ? RESPONSE_TEXTS.SELECT_MALE_SEX(userName) : RESPONSE_TEXTS.SELECT_FEMALE_SEX(userName)
        }
    }
}