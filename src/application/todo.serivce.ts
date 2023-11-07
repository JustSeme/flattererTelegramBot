import { SendMessageOptions } from "node-telegram-bot-api"
import { getWordByNumber } from "../helpers"
import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoType } from "../types/TodoType"
import { UserStateType } from "../types/UserStateType"
import { UserStateService } from "./userState.service"
import { BUTTONS_DATA } from "../constants"
import { UserStateRepository } from "../infrastructure/userState.repository"
import moment from "moment"

export const TodoService = {
    async createTodo(chatId: number, first_name: string, todoText: string, date: string, hours: string) {
        const todo: TodoType = {
            chatId: chatId,
            firstName: first_name,
            todoText: todoText,
            completed: false,
            todoDate: new Date(date),
            hourForNotify: +hours,
        }

        await UserStateService.deleteUserState(chatId)

        const res = await TodosRepository.createTodo(todo)

        const hoursWord = getWordByNumber(+hours, ['час', 'часа', 'часов'])

        return { responseText: `Задача создана! Жду не дождусь когда настанет ${date} чтобы в ${hours} ${hoursWord} снова написать тебе.` }
    },

    async showAllTodos(chatId: number) {
        const todos = await TodosRepository.getTodosByUser(chatId)

        if(!todos.length) {
            return { responseText: 'Никаких задач пока что нет... но я бы очень хотел их создать!' }
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

        return { responseText: `У тебя ${todos.length} ${taskWord}. Нажми на любую чтобы я дал более точную информацию`, options: todosOptions }
    },

    async startCreatingTodo(chatId: number) {
        const userState: UserStateType = await UserStateService.findOrCreateUserState(chatId, 'create_todo')

        if(!userState) {
            return { responseText: 'Что-то пошло не по плану, повтори попытку позже :-/' }
        }

        if(userState.todoText) {
            const todoTextExistsOptions: SendMessageOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: BUTTONS_DATA.DELETE_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.DELETE_TODO_TEXT_CMD },
                        { text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD }],
                        [{ text: BUTTONS_DATA.CONTINUE_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CONTINUE_CREATING_TODO_CMD }]
                    ]
                }
            }

            return { responseText: `Вы ведь не забыли, что мы уже создаём задачу с текстом ${userState.todoText}?`, options: todoTextExistsOptions }
        }

        const createTodoOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD },
                    { text: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_CMD }]
                ]
            }
        }

        return { responseText: 'Какой будет текст задачи?', options: createTodoOptions }
    },

    async deleteAllTodos(chatId: number) {
        const deletedCount = await TodosRepository.deleteAllTodos(chatId)

        if(deletedCount < 0) {
            return { responseText: 'Что-то пошло не по плану :-/' }
        }
        
        const word = getWordByNumber(deletedCount, ['задачу', 'задачи', 'задач'])

        return { responseText: `Твоя воля - закон. Хотя это печально, что мне пришлось удалить ${deletedCount} ${word}` }
    },

    async deleteTodoText(actualUserState: UserStateType) {
        if(!actualUserState || !actualUserState.todoText) {
            const stateNotExistsText = !actualUserState ? 'Извини, но ты сейчас не создаёшь никаких задач' : 'Текст для задачи и так отсутствует'
            return { responseText: stateNotExistsText }
        }

        actualUserState.todoText = null

        await UserStateRepository.updateUserState(actualUserState)

        const deleteTodoOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD }]
                ]
            }
        }

        return { responseText: 'Отлично, старый текст задачи удалён. Пожалуйста, введи новый', options: deleteTodoOptions }
    },

    async showTodo(todoId: string) {
        const todoById = await TodosRepository.getTodoById(todoId)

        if(!todoById) {
            return { responseText: 'Что-то пошло не по плану - не могу найти эту задачу.' }
        }
        const formattedDate = moment(todoById.todoDate).format('DD.MM.YYYY')

        return { responseText: `Текст задачи - ${todoById.todoText} \nДата выполнения - ${formattedDate} \nВремя выполнения - ${todoById.hourForNotify}:00 \n` }
    }
}