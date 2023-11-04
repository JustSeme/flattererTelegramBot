import { UserStateQueryRepository } from "../infrastructure/userState.query-repository"
import { SendMessageOptions } from "node-telegram-bot-api"
import { TodoType } from "../types/TodoType"
import { bot, calendar } from "../main"
import { CreateTodoStateType } from "../types/UserStateType"
import { UserStateService } from "../application/userState.service"
import { TodoService } from "../application/todo.serivce"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { getWordByNumber } from "../helpers"
import { BUTTONS_DATA } from "../constants"
import moment from "moment"

export async function callbackHandler(msg) {
    const message = msg.message
    const chatId = message.chat.id
    let data = msg.data
    const userId = msg.from.id

    const actualUserState = await UserStateQueryRepository.getUserState(userId)

    if (message.message_id == calendar.chats.get(chatId)) { // select date and time from calendar
        const res = calendar.clickButtonCalendar(msg);
        if (res !== -1) {
            const [date, hours] = res.split('/')

            if(actualUserState) {
                switch(actualUserState.messageThread) {
                    case('create_todo'):
                        const todo: TodoType = {
                            userId,
                            chatId: chatId,
                            firstName: msg.from.first_name,
                            todoText: actualUserState.todoText,
                            completed: false,
                            todoDate: new Date(date),
                            hourForNotify: +hours,
                        }

                        await TodoService.createTodo(todo)

                        await UserStateService.deleteUserState(userId)

                        const hoursWord = getWordByNumber(hours, ['час', 'часа', 'часов'])

                        return bot.sendMessage(chatId, `Задача создана! Жду не дождусь когда настанет ${date} чтобы в ${hours} ${hoursWord} снова написать тебе.`)
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
                        [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD },
                        { text: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_CMD }]
                    ]
                }
            }

            await UserStateService.createUserState(userState)

            return bot.sendMessage(chatId, 'Какой будет текст задачи?', createTodoOptions)
        case('cancel_creating_todo'):
            
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
                        [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD }]
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
            
            const word = getWordByNumber(deletedCount, ['задачу', 'задачи', 'задач'])

            return bot.sendMessage(chatId, `Твоя воля - закон. Хотя это печально, что мне пришлось удалить ${deletedCount} ${word}`)
        case('show_todo'):
            const todoById = await TodosQueryRepository.getTodoById(todoId)

            if(!todoById) {
                return bot.sendMessage(chatId, 'Что-то пошло не по плану - не могу найти эту задачу.')
            }
            const formattedDate = moment(todoById.todoDate).format('DD.MM.YYYY')

            return bot.sendMessage(chatId, `Текст задачи - ${todoById.todoText} \nДата выполнения - ${formattedDate} \nВремя выполнения - ${todoById.hourForNotify}:00 \n`)
        default:
            return bot.sendMessage(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
    }
}