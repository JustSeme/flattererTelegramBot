import { SendMessageOptions } from "node-telegram-bot-api"
import { BUTTONS_DATA, RESPONSE_ERRORS, RESPONSE_TEXTS } from "../constants"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { UserStateRepository } from "../infrastructure/userState.repository"
import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoService } from "./todo.serivce"

export const CommandsService = {
    start(): { stickerURL: string, responseText: string } {
        return {
            stickerURL: 'https://tlgrm.ru/_/stickers/364/159/364159a8-d72f-4a04-8aa1-3272dd144b06/4.webp',
            responseText: 'Приветствую, дорогой друг! Ты всегда приносишь столько радости своим присутствием. Готов помочь тебе с планированием задач, ведь ты всегда ставишь перед собой так много великих целей'
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
        const userState = await UserStateRepository.findUserState(chatId)

            if(!userState) {
                return { responseText: 'Простите, я не совсем понимаю ваш запрос. Мой фокус - помогать вам с задачами. Если нужна помощь, просто скажите, и я сделаю всё возможное, чтобы помочь вам.' }
            }

            switch(userState.messageThread) {
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
                            messageThread: userState.messageThread,
                            botMsgId: userState.botMsgId || null
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

                    return { ...showTodoResponseData, messageThread: userState.messageThread }
            }
    }
}