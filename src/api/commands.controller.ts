import { SendMessageOptions } from "node-telegram-bot-api"
import { BotService } from "../application/bot.service"
import { commonCommands } from "../constants"
import { TodoType } from "../types/TodoType"
import { bot, calendar } from "../main"
import { TodoStateType } from "../types/UserStateType"

export const start = () => {
    bot.setMyCommands(commonCommands)

    bot.on('message', async (msg, match) => {
        const chatId = msg.chat.id
        const recivedText = msg.text
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
                const todoOptions: SendMessageOptions = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Мои задачи', callback_data: 'show_all_todos',},
                            { text: 'Создать задачу', callback_data: 'create_todo' }]
                        ]
                    }
                }

                //calendar.startNavCalendar(msg)
                return bot.sendMessage(chatId, 'Ты лучший! Ах, да... задачи. Выбери, что ты хочешь сделать', todoOptions)
            default:
                return bot.sendMessage(chatId, 'Мило, что ты написала, но я тебя не понимаю!)')
        }
    })

    bot.on("callback_query", async (msg) => {
        const message = msg.message
        const chatId = message.chat.id
        const data = msg.data
        const userId = msg.from.id

        if (message.text === 'Пожалуйста, давай выберем дату:' && message.message_id == calendar.chats.get(chatId)) {
            const res = calendar.clickButtonCalendar(msg);
            if (res !== -1) {
                // here will be insert notify action
                return bot.sendMessage(chatId, `Я счастлив как никогда! Жду не дождусь когда настанет ${res} чтобы снова написать тебе.`);
            }
        }

        switch(data) {
            case('show_all_todos'):
                // here will be get all todos by userId
                return
            case('create_todo'):
                /* const todo: TodoType = {
                    userId: msg.from.id,
                    chatId: chatId,
                    firstName: msg.from.first_name,
                    todoText: 'str',
                    completed: false,
                    todoDate: new Date(),
                    todoTime: 'str'
                }
                await BotService.createTodo(todo) */
                const createTodoOptions: SendMessageOptions = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Я передумал создавать задачу', callback_data: 'cancel_create_todo' }]
                        ]
                    }
                }

                const userState: TodoStateType = { userId }

                await BotService.createUserState(userState)

                return bot.sendMessage(chatId, 'Для начала ответь, каким будет текст задачи?', createTodoOptions)
            case('cancel_create_todo'):
                
                await BotService.deleteUserState(userId)
                
                return bot.sendMessage(chatId, 'Если хочешь, можем и не создавать задачу. У меня ведь ещё есть как тебе угодить!')
            default:
                return bot.sendMessage(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
        }
    });
}