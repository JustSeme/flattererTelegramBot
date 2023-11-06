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

export async function callbackController(msg) {
    const message = msg.message
    const chatId = message.chat.id
    const userId = msg.from.id
    let data = msg.data
    let responseData

    const actualUserState = await UserStateQueryRepository.getUserState(userId)

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
        case(BUTTONS_DATA.CONTINUE_CREATING_TODO_CMD):
            return calendar.startNavCalendar(msg)
        default:
            return bot.sendMessage(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
    }
}