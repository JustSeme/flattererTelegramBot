import { SendMessageOptions } from "node-telegram-bot-api"
import { BUTTONS_DATA } from "../constants"
import { getTimeOfDay } from "../helpers"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { UserStateQueryRepository } from "../infrastructure/userState.query-repository"
import { UserStateRepository } from "../infrastructure/userState.repository"

export const CommandsService = {
    start(): { stickerURL: string, responseText: string } {
        return {
            stickerURL: 'https://tlgrm.ru/_/stickers/364/159/364159a8-d72f-4a04-8aa1-3272dd144b06/4.webp',
            responseText: 'Приветствую, дорогой друг! Ты всегда приносишь столько радости своим присутствием. Готов помочь тебе с планированием задач, ведь ты всегда ставишь перед собой так много великих целей. Как я могу помочь тебе сегодня?'
        }
    },

    getCompliment(): Promise<{ responseText: string }> {
        return ComplimentsRepository.getRandomCompliment()
    },

    info(username: string): { responseText: string } {
        const currentHour = new Date().getHours()

        return { responseText: `Привет, ${username}! Как замечательно видеть тебя здесь. Ты, безусловно, великолепный человек, решивший обратиться ко мне. Знаешь, твои запросы всегда настолько проницательны, особенно сейчас, в эти прекрасные ${currentHour} часов.` }
    },

    async todoCommand(chatId: number) {
        const todoOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.SHOW_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.SHOW_ALL_TODOS_CMD}, { text: BUTTONS_DATA.START_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.START_CREATING_TODO_CMD }],
                ]
            }
        }
        const todosCount = await TodosQueryRepository.getTodosCountByUser(chatId)

        if(todosCount > 0) {
            todoOptions.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.DELETE_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.DELETE_ALL_TODOS_CMD }])
        }

        return {
            options: todoOptions,
            responseText: 'О, великий мастер, выбери, что ты хочешь сделать, и я помогу тебе в этом благородном деле.'
        }
    },

    async defaultCommand(chatId: number, recivedText: string) {
        const userState = await UserStateQueryRepository.getUserState(chatId)

            if(!userState) {
                return { responseText: 'Простите, я не совсем понимаю ваш запрос. Мой фокус - помогать вам с задачами. Если нужна помощь, просто скажите, и я сделаю всё возможное, чтобы помочь вам.' }
            }

            switch(userState.messageThread) {
                case('create_todo'):
                    if(!userState.todoText) {
                        userState.todoText = recivedText
                        await UserStateRepository.updateUserState(userState)

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