import { SendMessageOptions } from "node-telegram-bot-api"
import { BUTTONS_DATA } from "../constants"
import { getTimeOfDay } from "../helpers"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { UserStateQueryRepository } from "../infrastructure/userState.query-repository"
import { UserStateService } from "./userState.service"

export const CommandsService = {
    start(): { stickerURL: string, responseText: string } {
        return {
            stickerURL: 'https://tlgrm.ru/_/stickers/364/159/364159a8-d72f-4a04-8aa1-3272dd144b06/4.webp',
            responseText: 'Привет, красотка! Я самый льстивый бот в телеграме. Если хочешь чтобы я радовал тебя коплиментами ежедневно - подпишись на рассылку командой /register'
        }
    },

    getCompliment(): Promise<{ responseText: string }> {
        return ComplimentsRepository.getRandomCompliment()
    },

    info(currentUserDate: number, username: string): { responseText: string } {
        const timeOfDay = getTimeOfDay(currentUserDate)

        return { responseText: `Ты всегда так нежно спрашиваешь у меня информацию... Сейчас ${timeOfDay} и твоё прекрасное имя - ${username}!` }
    },

    async todoCommand(chatId: number) {
        const todoOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.SHOW_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.SHOW_ALL_TODOS_CMD}, { text: BUTTONS_DATA.START_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.START_CREATING_TODO_CMD }],
                ]
            }
        }
        const todosCount = await TodosQueryRepository.getTodosCountByUserId(chatId)

        if(todosCount > 0) {
            todoOptions.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.DELETE_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.DELETE_ALL_TODOS_CMD }])
        }

        return {
            options: todoOptions,
            responseText: 'Ты лучший! Ах, да... задачи. Выбери, что ты хочешь сделать'
        }
    },

    async defaultCommand(chatId: number, recivedText: string) {
        const userState = await UserStateQueryRepository.getUserState(chatId)

            if(!userState) {
                return { responseText: 'Мило, что ты написала, но я тебя не понимаю!)' }
            }

            switch(userState.messageThread) {
                case('create_todo'):
                    if(!userState.todoText) {
                        userState.todoText = recivedText
                        await UserStateService.updateUserState(userState)

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
                            isShowCalendar: true
                        }
                    }
            }
    }
}