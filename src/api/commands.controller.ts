import { SendMessageOptions } from "node-telegram-bot-api"
import { BotService } from "../application/bot.service"
import { commonCommands } from "../constants"
import { TodoType } from "../types/TodoType"
import { bot, calendar } from "../main"
import { CreateTodoStateType } from "../types/UserStateType"
import { UserStateQueryRepository } from "../infrastructure/userState.query-repository"
import { UserStateService } from "../application/userState.service"
import { TodoService } from "../application/todo.serivce"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { getWordByNumber } from "../helpers"

export const start = () => {
    bot.setMyCommands(commonCommands)

    bot.on('message', async (msg, match) => {
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
                            [{ text: 'Мои задачи', callback_data: 'show_all_todos'}, { text: 'Создать задачу', callback_data: 'create_todo' }],
                        ]
                    }
                }
                const todosCount = await TodosQueryRepository.getTodosCountByUserId(userId)

                if(todosCount > 0) {
                    todoOptions.reply_markup.inline_keyboard.push([{ text: 'Удалить все задачи', callback_data: 'delete_all_todos' }])
                }

                return bot.sendMessage(chatId, 'Ты лучший! Ах, да... задачи. Выбери, что ты хочешь сделать', todoOptions)
            // for test
            case '/del-thread':
                const createTodoOptions: SendMessageOptions = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Я передумал создавать задачу', callback_data: 'delete_user_state' }]
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
                                        [{ text: 'Хочу поменять текст задачи', callback_data: 'delete_todo_text' }]
                                    ]
                                }
                            }

                            await bot.sendMessage(chatId, 'Такого рода задачи могут быть только у поистине величайших людей! Текст задачи записан! А когда нужно выполнить эту задачу?', updateTodoTextOptions)
                            return calendar.startNavCalendar(msg)
                        }
                }
        }
    })

    bot.on('callback_query', async (msg) => {
        const message = msg.message
        const chatId = message.chat.id
        let data = msg.data
        const userId = msg.from.id

        const actualUserState = await UserStateQueryRepository.getUserState(userId)

        if (message.message_id == calendar.chats.get(chatId)) { // select date and time from calendar
            const res = calendar.clickButtonCalendar(msg);
            if (res !== -1) {
                const [date, time] = res.split('/')

                if(actualUserState) {
                    switch(actualUserState.messageThread) {
                        case('create_todo'):
                            const todo: TodoType = {
                                userId: msg.from.id,
                                chatId: chatId,
                                firstName: msg.from.first_name,
                                todoText: actualUserState.todoText,
                                completed: false,
                                todoDate: date,
                                todoTime: time,
                            }

                            await TodoService.createTodo(todo)

                            await UserStateService.deleteUserState(userId)
                            return bot.sendMessage(chatId, `Задача создана! Жду не дождусь когда настанет ${date} чтобы в ${time} снова написать тебе.`)
                        default:
                            return
                    }
                }
            } else {
                return
            }
        }

        let todoId = ''
        if(data.indexOf('show_todo-') > -1) {
            todoId = data.split('-')[1]
            data = 'show_todo'
        }

        switch(data) {
            case('show_all_todos'):
                const todos = await TodosQueryRepository.getTodosByUserId(userId)

                if(!todos.length) {
                    return bot.sendMessage(chatId, 'Никаких задач пока что нет... но я бы очень хотел их создать!')
                }

                const todosOptions = {
                    reply_markup: {
                        inline_keyboard: []
                    }
                }

                for(const todo of todos) {
                    todosOptions.reply_markup.inline_keyboard.push([{ text: todo.todoText, callback_data: `show_todo-${todo._id}` }])
                }

                const taskWord = getWordByNumber(todos.length, ['задача', 'задачи', 'задач'])
                
                return bot.sendMessage(chatId, `У тебя ${todos.length} ${taskWord}. Нажми на любую чтобы я дал более точную информацию`, todosOptions)
            case('create_todo'):
                const userState: CreateTodoStateType = {
                    userId,
                    todoText: null,
                    todoDate: null,
                    todoTime: null,
                    messageThread: 'create_todo'
                }

                const createTodoOptions: SendMessageOptions = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Отменить создание', callback_data: 'delete_user_state' },
                            { text: 'Стандартный', callback_data: 'set_standard_todo_text' }]
                        ]
                    }
                }

                await UserStateService.createUserState(userState)

                return bot.sendMessage(chatId, 'Какой будет текст задачи?', createTodoOptions)
            case('delete_user_state'):
                
                await UserStateService.deleteUserState(userId)
                
                return bot.sendMessage(chatId, 'Если хочешь, можем и не создавать задачу. У меня ведь ещё есть как тебе угодить!')
            case('delete_todo_text'):
                if(!actualUserState || !actualUserState.todoText) {
                    const stateNotExistsText = !actualUserState ? 'Извини, господин, но ты сейчас не создаёшь никаких задач' : 'Текст для задачи и так отсутствует'
                    return bot.sendMessage(chatId, stateNotExistsText)
                }

                actualUserState.todoText = null

                await UserStateService.updateUserState(actualUserState)

                const deleteTodoOptions: SendMessageOptions = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Давай просто не будем создавать задачу', callback_data: 'delete_user_state' }]
                        ]
                    }
                }
                return bot.sendMessage(chatId, 'Отлично, старый текст задачи удалён. Пожалуйста, введи новый', deleteTodoOptions)
            case('set_standard_todo_text'):

                const standardText = 'Сделать возможность изменять стандартный текст для пользователя'
                actualUserState.todoText = standardText

                await UserStateService.updateUserState(actualUserState)

                await bot.sendMessage(chatId, `Всё ради тебя! Стандартный текст - "${standardText}" установлен. А когда нужно выполнить задачу?`)
                return calendar.startNavCalendar(message)
            case('delete_all_todos'):
                const deletedCount = await TodoService.deleteAllTodos(userId)

                if(deletedCount < 0) {
                    return bot.sendMessage(chatId, 'Что-то пошло не по плану :-/')
                }

                return bot.sendMessage(chatId, `Твоя воля - закон. Хотя это печально, что мне пришлось удалить ${deletedCount} задач`)
            case('show_todo'):
                const todoById = await TodosQueryRepository.getTodoById(todoId)

                if(!todoById) {
                    return bot.sendMessage(chatId, 'Что-то пошло не по плану - не могу найти эту задачу.')
                }

                return bot.sendMessage(chatId, `Текст задачи - ${todoById.todoText} \nДата выполнения - ${todoById.todoDate} \nВремя выполнения - ${todoById.todoTime} \n`)
            default:
                return bot.sendMessage(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
        }
    });
}