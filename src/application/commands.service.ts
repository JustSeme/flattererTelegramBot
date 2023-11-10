import { SendMessageOptions } from "node-telegram-bot-api"
import { BUTTONS_DATA, RESPONSE_ERRORS, RESPONSE_TEXTS } from "../constants"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoService } from "./todo.serivce"
import { BasicUserStateType } from "../types/UserStateType"
import { BasicUserStateService } from "./BasicUserState.serivce"
import { bot } from "../main"

export const CommandsService = {
    async start(msg: any, chatId: number, username: string) {
        const basicUserState: BasicUserStateType = {
            chatId,
            language: 'ru',
            sex: null,
            stateType: 'basic',
            name: username
        }

        await BasicUserStateService.findOrCreateBasicUserState(chatId, basicUserState) 

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

    info(msg: any, chatId: number, username: string) {
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

    async defaultCommand(chatId: number, recivedText: string) {
        const userState = await UserStateRepository.findUserState(chatId)

            if(!userState) {
                return { responseText: 'Простите, я не совсем понимаю ваш запрос. Мой фокус - помогать вам с задачами. Если нужна помощь, просто скажите, и я сделаю всё возможное, чтобы помочь вам.' }
            }

            switch(userState.stateType) {
                case('create_todo'):
                    if(!userState.todoText) {
                        await UserStateRepository.updateStateTodoText(userState._id, recivedText)

                        const updateTodoTextOptions: SendMessageOptions = {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: BUTTONS_DATA.DELETE_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.DELETE_TODO_TEXT_CMD }]
                                ]
                            }
                        }

                        return { 
                            responseText: 'Такого рода задачи могут быть только у поистине величайших людей! Текст задачи записан! А когда нужно выполнить эту задачу?',
                            options: updateTodoTextOptions,
                            StateType: userState.stateType,
                        }
                    }
                case('change_todo_text'):
                    //@ts-ignore in this case todoId exists in userState
                    const isChanged = await TodosRepository.changeTodoText(userState.todoId, recivedText)

                    if(!isChanged) {
                        return { responseText: RESPONSE_ERRORS.SOMETHING_WRONG}
                    }

                    await UserStateRepository.deleteUserState(chatId, 'change_todo_text')

                    //@ts-ignore in this case todoId exists in userState
                    const showTodoResponseData = await TodoService.showTodo(userState.todoId)

                    return { ...showTodoResponseData, StateType: userState.stateType }
            }
    },

    bug() {
        return {
            responseText: 'Привет, догорой пользователь! Если ты обнаружил ошибку в моей работе, пожалуйста, напиши разработчику\nhttps://t.me/justseme'
        }
    }
}