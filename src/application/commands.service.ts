import { SendMessageOptions } from "node-telegram-bot-api"
import { BUTTONS_DATA, RESPONSE_ERRORS, RESPONSE_TEXTS, RESPONSE_WARNS } from "../constants"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoService } from "./todo.serivce"
import { BasicUserStateType } from "../types/UserStateType"
import { BasicUserStateService } from "./BasicUserState.serivce"
import { bot, calendar } from "../main"
import { TodoUserStateType } from "../types/UserStateType"
import { WithId } from "mongodb"

export const CommandsService = {
    async start(msg: any, chatId: number) {
        if(!msg.basicUserState) {
            const basicUserState: BasicUserStateType = {
                chatId,
                language: 'ru',
                sex: null,
                stateType: 'basic',
                name: msg.from.first_name
            }
    
            await BasicUserStateService.createBasicUserState(chatId, basicUserState) 
        }

        const options: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.SELECT_RU_LANG_TXT, callback_data: BUTTONS_DATA.SELECT_RU_LANG_CMD },
                    { text: BUTTONS_DATA.SELECT_EN_LANG_TXT, callback_data: BUTTONS_DATA.SELECT_EN_LANG_CMD }],
                ]
            }
        }

        const stickerURL = 'https://tlgrm.ru/_/stickers/364/159/364159a8-d72f-4a04-8aa1-3272dd144b06/4.webp'
        const responseText = RESPONSE_TEXTS.START

        await bot.sendSticker(chatId, stickerURL)
        return bot.send(chatId, responseText, options)
    },

    async getCompliment(msg: any, chatId: number){
        const responseText = await ComplimentsRepository.getRandomCompliment()

        return bot.send(chatId, responseText)
    },

    info(msg: any, chatId: number) {
        const username = msg.basicUserState.name
        const currentHour = new Date().getHours()

        const responseText = RESPONSE_TEXTS.INFO(username, currentHour)
        return bot.send(chatId, responseText)
    },

    async todoCommand(msg: any, chatId: number) {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.SHOW_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.SHOW_ALL_TODOS_CMD}, { text: BUTTONS_DATA.START_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.START_CREATING_TODO_CMD }],
                ]
            }
        }
        const todosCount = await TodosQueryRepository.getTodosCountByUser(chatId)

        if(todosCount > 0) {
            options.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.DELETE_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.DELETE_ALL_TODOS_CMD }])
        }
        
        const responseText = RESPONSE_TEXTS.COMMAND_TODO

        return bot.send(chatId, responseText, options)
    },

    async defaultCommand(msg: any, chatId: number) {
        const recivedText = msg.text
        const actualUserState = await UserStateRepository.findActualUserState(chatId)
        let responseText: string

        if(!actualUserState) {
            responseText = RESPONSE_WARNS.DEFAULT
            return bot.send(chatId, responseText)
        }

        switch(actualUserState.stateType) {
            case('create_todo'):
                if(!actualUserState.todoText) {
                    await UserStateRepository.updateStateTodoText(actualUserState._id, recivedText)
                    const options: SendMessageOptions = {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: BUTTONS_DATA.DELETE_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.DELETE_TODO_TEXT_CMD }]
                            ]
                        }
                    }
                    const responseText = RESPONSE_TEXTS.ADD_TOO_TEXT

                    await bot.send(chatId, responseText, options)
                    return calendar.startNavCalendar(msg)
                } 
            case('change_todo_text'):
                //@ts-ignore in this case todoId exists in userState
                const isChanged = await TodosRepository.changeTodoText(actualUserState.todoId, recivedText)

                if(!isChanged) {
                    return { responseText: RESPONSE_ERRORS.SOMETHING_WRONG}
                }

                await UserStateRepository.deleteUserState(chatId, 'change_todo_text')
                
                //@ts-ignore in this case todoId exists in userState
                const showTodoResponseData = await TodoService.showTodo(actualUserState.todoId)

                return bot.send(chatId, showTodoResponseData.responseText, showTodoResponseData.options)
        }
    },

    bug(msg: any, chatId: number) {
        const responseText = RESPONSE_TEXTS.CMD_BUG
        
        return bot.send(chatId, responseText)
    }
}