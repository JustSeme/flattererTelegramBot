import { SendMessageOptions } from "node-telegram-bot-api"
import { BotService } from "../application/bot.service"
import { bot, calendar } from "../main"
import { UserStateQueryRepository } from "../infrastructure/userState.query-repository"
import { UserStateService } from "../application/userState.service"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { BUTTONS_DATA } from "../constants"

export async function messagesHandler(msg) {
    const chatId = msg.chat.id
    const recivedText = msg.text
    const userId = msg.from.id
    let responseData

    switch(recivedText) {
        case '/start':
            responseData = BotService.start()

            await bot.sendSticker(chatId, responseData.stickerURL)
            return bot.sendMessage(chatId, responseData.responseText)
        case '/info': 
            responseData = BotService.info(msg.date, msg.chat.username)
            return bot.sendMessage(chatId, responseData.responseText)
        case '/compliment':
            responseData = await BotService.getCompliment()
            return bot.sendMessage(chatId, responseData.responseText)
        case '/todo':
            const todoOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: BUTTONS_DATA.SHOW_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.SHOW_ALL_TODOS_CMD}, { text: BUTTONS_DATA.CREATE_TODO_TXT, callback_data: BUTTONS_DATA.CREATE_TODO_CMD }],
                    ]
                }
            }
            const todosCount = await TodosQueryRepository.getTodosCountByUserId(userId)

            if(todosCount > 0) {
                todoOptions.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.DELETE_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.DELETE_ALL_TODOS_CMD }])
            }

            return bot.sendMessage(chatId, 'Ты лучший! Ах, да... задачи. Выбери, что ты хочешь сделать', todoOptions)
        // for test
        case '/del-thread':
            const createTodoOptions: SendMessageOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT }]
                    ]
                }
            }
            return bot.sendMessage(chatId, 'kek', createTodoOptions)
        default:
            const userState = await UserStateQueryRepository.getUserState(userId)

            if(!userState) {
                return bot.sendMessage(chatId, 'Мило, что ты написала, но я тебя не понимаю!)')
            }

            switch(userState.messageThread) {
                case('create_todo'):
                    if(!userState.todoText) {
                        userState.todoText = recivedText
                        await UserStateService.updateUserState(userState)

                        const updateTodoTextOptions: SendMessageOptions = {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: BUTTONS_DATA.DELETE_ALL_TODOS_TXT, callback_data: BUTTONS_DATA.DELETE_ALL_TODOS_CMD }]
                                ]
                            }
                        }

                        await bot.sendMessage(chatId, 'Такого рода задачи могут быть только у поистине величайших людей! Текст задачи записан! А когда нужно выполнить эту задачу?', updateTodoTextOptions)
                        return calendar.startNavCalendar(msg)
                    }
            }
    }
}