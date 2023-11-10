import { SendMessageOptions } from "node-telegram-bot-api"
import { getWordByNumber } from "../helpers"
import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoType } from "../types/TodoType"
import { ChangeTodoTextStateType, CreateTodoStateType, TodoUserStateType } from "../types/UserStateType"
import { UserStateService } from "./userState.service"
import { BUTTONS_DATA, RESPONSE_ERRORS, RESPONSE_TEXTS, RESPONSE_WARNS } from "../constants"
import { UserStateRepository } from "../infrastructure/userState.repository"
import moment from "moment"
import { WithId } from "mongodb"

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

        await UserStateService.deleteUserState(chatId, 'create_todo')

        const insertedResult = await TodosRepository.createTodo(todo)

        return this.showTodo(insertedResult.insertedId)
    },

    async showAllTodos(chatId: number) {
        const todos = await TodosRepository.getTodosByUser(chatId)

        if(!todos.length) {
            return { responseText: 'Похоже, у тебя еще нет задач. Но не волнуйся, ведь самое интересное только начинается! Давай создадим твои первые задачи вместе.' }
        }

        const todosOptions = {
            reply_markup: {
                inline_keyboard: []
            }
        }

        for(const todo of todos) {
            todosOptions.reply_markup.inline_keyboard.push([{ text: todo.todoText, callback_data: BUTTONS_DATA.SHOW_TODO_CMD + todo._id }])
        }

        const taskWord = getWordByNumber(todos.length, ['задача', 'задачи', 'задач'])

        return { responseText: `У тебя есть ${todos.length} ${taskWord} в списке. Выбери нужную задачу для более подробной информации.`, options: todosOptions }
    },

    async startCreatingTodo(chatId: number) {
        const userState: TodoUserStateType = await UserStateService.findOrCreateTodoUserState(chatId, 'create_todo')

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

            return {
                responseText: `Понял, что ты хочешь еще раз создать задачу. Однако, ты уже начал создавать задачу - "${userState.todoText}", но не указал дату и время выполнения.`,
                options: todoTextExistsOptions,
            }
        }

        const createTodoOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD },
                    { text: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_CMD }]
                ]
            }
        }

        return {
            responseText: 'Отлично! Введи текст твоей новой задачи',
            options: createTodoOptions,
            StateType: 'create_todo'
        }
    },

    async deleteAllTodos(chatId: number) {
        const deletedCount = await TodosRepository.deleteAllTodos(chatId)

        if(deletedCount < 0) {
            return { responseText: RESPONSE_ERRORS.SOMETHING_WRONG }
        }
        
        const word = getWordByNumber(deletedCount, ['задачу', 'задачи', 'задач'])

        return { responseText: `Твоя воля - закон. Хотя это печально, что мне пришлось удалить ${deletedCount} ${word}` }
    },

    async deleteTodoText(actualUserState: WithId<TodoUserStateType>, username: string) {
        if(!actualUserState || !actualUserState.todoText) {
            const stateNotExistsText = !actualUserState 
            ? `Понял вас, благородный ${username}. Однако, в текущий момент вы не создаёте задач, и, следовательно, нет необходимости в удаление её текста. Всегда готов служить вашим великим поручениям!`
            : `Понял вас, благородный ${username}. Однако, в текущий момент текст задачи отсутствует, и, следовательно, нет необходимости в её удалении. Всегда готов служить вашим великим поручениям!`
            return { responseText: stateNotExistsText }
        }

        await UserStateRepository.updateStateTodoText(actualUserState._id, null)

        const deleteTodoOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD }]
                ]
            }
        }

        return { responseText: 'Ваше великолепие, текст задачи благополучно удалён! Однако, ваше величие не оставит нас без новой блистательной задачи. Пожалуйста, раскройте свой ум и введите новый текст задачи для продолжения благородного творчества!', options: deleteTodoOptions }
    },

    async showTodo(todoId: string) {
        const todoById = await TodosRepository.getTodoById(todoId)

        if(!todoById) {
            return { responseText: RESPONSE_ERRORS.DOES_NOT_EXISTS_TODO }
        }
        const formattedDate = moment(todoById.todoDate).format('DD.MM.YYYY')

        let todoCompletedEmoj: string
        
        const showTodoOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CHANGE_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.CHANGE_TODO_TEXT_CMD + todoId }]
                ]
            }
        }

        if(todoById.completed) {
            todoCompletedEmoj = '✅'
            showTodoOptions.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.UNCOMPLETE_TODO_TXT, callback_data: BUTTONS_DATA.UNCOMPLETE_TODO_CMD + todoId }])
        } else {
            todoCompletedEmoj = '❌'
            showTodoOptions.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.COMPLETE_TODO_TXT, callback_data: BUTTONS_DATA.COMLETE_TODO_CMD + todoId }])
        }
        

        return {
            responseText: `Текст задачи: ${todoById.todoText}\n\nДата выполнения: ${formattedDate}\n\nВремя выполнения: ${todoById.hourForNotify}:00\n\nВыполнена:  ${todoCompletedEmoj}\n\nЭта блестящая задача требует вашего великого внимания и благородного усердия. Пожалуйста, не забудьте принять вызов вашего гения и великолепия!`,
            options: showTodoOptions }
    },

    async changeCompleted(todoId: string, completed: boolean) {
        const todoById = await TodosRepository.getTodoById(todoId)

        if(!todoById) {
            return { responseText: RESPONSE_ERRORS.DOES_NOT_EXISTS_TODO }
        }

        if(todoById.completed === completed) {
            return { responseText: RESPONSE_WARNS.STATUS_TODO_ALREADY_SETTED }
        }

        const isUpdated = await TodosRepository.changeCompleted(todoId, completed)

        if(!isUpdated) {
            return { responseText: RESPONSE_ERRORS.SOMETHING_WRONG }
        }

        return this.showTodo(todoId)
    },

    async changeTodoText(chatId: number, todoId: string) {
        await UserStateService.findOrCreateTodoUserState(chatId, 'change_todo_text', todoId)

        return { responseText: RESPONSE_TEXTS.CHANGE_TODO_TEXT_STATE_CREATED }
    }
}