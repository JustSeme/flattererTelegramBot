import { SendMessageOptions } from "node-telegram-bot-api"
import { getTodoId, getWordByNumber } from "../helpers"
import { TodosRepository } from "../infrastructure/todos.repository"
import { TodoType } from "../types/TodoType"
import { UserStateService } from "./userState.service"
import { BUTTONS_DATA, RESPONSE_ERRORS, RESPONSE_TEXTS, RESPONSE_WARNS } from "../constants"
import { UserStateRepository } from "../infrastructure/userState.repository"
import moment from "moment"
import { bot } from "../main"

export const TodoService = {
    async createTodo(msg: any, chatId: number, todoText: string, date: string, hours: string) {
        const todo: TodoType = {
            chatId: chatId,
            todoText: todoText,
            firstName: msg.basicUserState.name,
            completed: false,
            todoDate: new Date(date),
            hourForNotify: +hours,
        }

        await UserStateService.deleteUserState(chatId, 'create_todo')

        const insertedResult = await TodosRepository.createTodo(todo)

        return this.showTodo(msg, chatId, insertedResult.insertedId)
    },

    async showAllTodos(msg: any, chatId: number) {
        const todos = await TodosRepository.getTodosByUser(chatId)

        if(!todos.length) {
            return { responseText: 'Похоже, у тебя еще нет задач. Но не волнуйся, ведь самое интересное только начинается! Давай создадим твои первые задачи вместе.' }
        }

        const options = {
            reply_markup: {
                inline_keyboard: []
            }
        }

        for(const todo of todos) {
            options.reply_markup.inline_keyboard.push([{ text: todo.todoText, callback_data: BUTTONS_DATA.SHOW_TODO_CMD + todo._id }])
        }

        const taskWord = getWordByNumber(todos.length, ['задача', 'задачи', 'задач'])

        const responseText = RESPONSE_TEXTS.SHOW_ALL_TODOS(todos.length, taskWord)

        return bot.send(chatId, responseText, options)
    },

    async startCreatingTodo(msg: any, chatId: number) {
        const userState = await UserStateService.findOrCreateTodoUserState(chatId, 'create_todo')

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
            const responseText = RESPONSE_WARNS.CREATING_TODO_STATE_EXISTS(userState.todoText)

            return bot.send(chatId, responseText, todoTextExistsOptions)
        }

        const createTodoOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD },
                    { text: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.SET_STANDARD_TODO_TEXT_CMD }]
                ]
            }
        }

        const responseText = RESPONSE_TEXTS.START_CREATING_TODOS

        return bot.send(chatId, responseText, createTodoOptions)
    },

    async deleteAllTodos(msg: any, chatId: number) {
        const deletedCount = await TodosRepository.deleteAllTodos(chatId)

        if(deletedCount < 0) {
            return { responseText: RESPONSE_ERRORS.SOMETHING_WRONG }
        }
        
        const word = getWordByNumber(deletedCount, ['задачу', 'задачи', 'задач'])

        const responseText = RESPONSE_TEXTS.DELETE_ALL_TODOS(deletedCount, word)

        return bot.send(chatId, responseText)
    },

    async deleteTodoText(msg: any, chatId: number) {
        const actualUserState = await UserStateRepository.findActualUserState(chatId)

        if(!actualUserState || !actualUserState.todoText || actualUserState.stateType !== 'create_todo') {
            const responseText = RESPONSE_WARNS.CREATE_TODO_STATE_NOT_EXISTS(msg.basicUserState.name || 'noname')

            return bot.send(chatId, responseText)
        }

        await UserStateRepository.updateStateTodoText(actualUserState._id, null)

        const deleteTodoOptions: SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CANCEL_CREATING_TODO_TXT, callback_data: BUTTONS_DATA.CANCEL_CREATING_TODO_CMD }]
                ]
            }
        }

        const responseText = RESPONSE_TEXTS.CREATE_TODO_TEXT_DELETED

        return bot.send(chatId, responseText, deleteTodoOptions)
    },

    async showTodo(msg: any, chatId: number, id?: string) {
        if(!id) {
            const { todoId } = getTodoId(msg.data)
            id = todoId
        }

        const todoById = await TodosRepository.getTodoById(id)

        if(!todoById) {
            return { responseText: RESPONSE_ERRORS.DOES_NOT_EXISTS_TODO }
        }
        const formattedDate = moment(todoById.todoDate).format('DD.MM.YYYY')

        let todoCompletedEmoj: string
        
        const showTodoOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: BUTTONS_DATA.CHANGE_TODO_TEXT_TXT, callback_data: BUTTONS_DATA.CHANGE_TODO_TEXT_CMD + id }]
                ]
            }
        }

        if(todoById.completed) {
            todoCompletedEmoj = '✅'
            showTodoOptions.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.UNCOMPLETE_TODO_TXT, callback_data: BUTTONS_DATA.UNCOMPLETE_TODO_CMD + id }])
        } else {
            todoCompletedEmoj = '❌'
            showTodoOptions.reply_markup.inline_keyboard.push([{ text: BUTTONS_DATA.COMPLETE_TODO_TXT, callback_data: BUTTONS_DATA.COMLETE_TODO_CMD + id }])
        }
        const responseText = RESPONSE_TEXTS.SHOW_TODO(todoById.todoText, formattedDate, todoById.hourForNotify, todoCompletedEmoj)

        return bot.send(chatId, responseText, showTodoOptions)
    },

    async completeTodo(msg: any, chatId: number) {
        const { todoId } = getTodoId(msg.data)

        const todoById = await TodosRepository.getTodoById(todoId)

        if(!todoById) {
            return { responseText: RESPONSE_ERRORS.DOES_NOT_EXISTS_TODO }
        }

        if(todoById.completed === true) {
            return { responseText: RESPONSE_WARNS.STATUS_TODO_ALREADY_SETTED }
        }

        await TodosRepository.changeCompleted(todoId, true)

        return this.showTodo(msg, chatId, todoId)
    },

    async unCompleteTodo(msg: any, chatId: number) {
        const { todoId } = getTodoId(msg.data)

        const todoById = await TodosRepository.getTodoById(todoId)

        if(!todoById) {
            return { responseText: RESPONSE_ERRORS.DOES_NOT_EXISTS_TODO }
        }

        if(todoById.completed === true) {
            return { responseText: RESPONSE_WARNS.STATUS_TODO_ALREADY_SETTED }
        }

        await TodosRepository.changeCompleted(todoId, true)

        return this.showTodo(msg, chatId, todoId)
    },

    async changeTodoText(msg: any, chatId: number) {
        const { todoId } = getTodoId(msg.data)

        await UserStateService.findOrCreateTodoUserState(chatId, 'change_todo_text', todoId)

        return bot.send(chatId, RESPONSE_TEXTS.CHANGE_TODO_TEXT_STATE_CREATED)
    }
}