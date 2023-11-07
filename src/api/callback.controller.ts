import { UserStateQueryRepository } from "../infrastructure/userState.query-repository"
import { SendMessageOptions } from "node-telegram-bot-api"
import { bot, calendar } from "../main"
import { UserStateService } from "../application/userState.service"
import { TodoService } from "../application/todo.serivce"
import { TodosQueryRepository } from "../infrastructure/todos.query-repository"
import { getWordByNumber } from "../helpers"
import { BUTTONS_DATA } from "../constants"
import moment from "moment"

export async function callbackController(msg) {
    const message = msg.message
    const chatId = message.chat.id
    let data = msg.data
    let responseData

    const actualUserState = await UserStateQueryRepository.getUserState(chatId)

    if (message.message_id == calendar.chats.get(chatId)) { // select date and time from calendar
        const res = calendar.clickButtonCalendar(msg);
        if (res !== -1) {
            const [date, hours] = res.split('/')

            if(actualUserState) {
                switch(actualUserState.messageThread) {
                    case('create_todo'):
                        responseData = await TodoService.createTodo(chatId, msg.from.first_name, actualUserState.todoText, date, hours)

                        return bot.sendMessage(chatId, responseData.responseText)
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
            responseData = await TodoService.showAllTodos(chatId)
            
            return bot.sendMessage(chatId, responseData.responseText, responseData.options)
        case('start_creating_todo'):
            responseData = await TodoService.startCreatingTodo(chatId)

            return bot.sendMessage(chatId, responseData.responseText, responseData.options)
        case('cancel_creating_todo'):
            
            await UserStateService.deleteUserState(chatId)
            
            return bot.sendMessage(chatId, 'Если хочешь, можем и не создавать задачу. У меня ведь ещё есть как тебе угодить!')
        case('delete_todo_text'):
            responseData = await TodoService.deleteTodoText(actualUserState)

            return bot.sendMessage(chatId, responseData.responseText, responseData.options)
        case('set_standard_todo_text'):
            responseData = await UserStateService.setStandardTodoText(actualUserState)

            await bot.sendMessage(chatId, responseData.responseText)
            return calendar.startNavCalendar(message)
        case('delete_all_todos'):
            responseData = await TodoService.deleteAllTodos(chatId)

            return bot.sendMessage(chatId, responseData.responseText)
        case('show_todo'):
            responseData = await TodoService.showTodo(todoId)

            return bot.sendMessage(chatId, responseData.responseText, responseData.options)
        case(BUTTONS_DATA.CONTINUE_CREATING_TODO_CMD):
            return calendar.startNavCalendar(message)
        default:
            return bot.sendMessage(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
    }
}