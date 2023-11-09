import { bot, calendar } from "../main"
import { UserStateService } from "../application/userState.service"
import { TodoService } from "../application/todo.serivce"
import { BUTTONS_DATA, commandsWithId } from "../constants"

export async function callbackController(msg) {
    const message = msg.message
    const chatId = message.chat.id
    let data = msg.data
    let responseData

    const actualUserState = await UserStateService.findUserState(chatId)

    if (message.message_id == calendar.chats.get(chatId)) { // select date and time from calendar
        const res = calendar.clickButtonCalendar(msg);
        if (res !== -1) {
            const [date, hours] = res.split('/')

            if(actualUserState) {
                switch(actualUserState.stateType) {
                    case('create_todo'):
                        responseData = await TodoService.createTodo(chatId, msg.from.first_name, actualUserState.todoText, date, hours)

                        return bot.send(chatId, responseData.responseText, responseData.options)
                    default:
                        return
                }
            }
        } else {
            return
        }
    }

    let todoId = ''
    commandsWithId.some(cmd => {
        if(data.includes(cmd)) {
            todoId = data.split('-')[1]
            data = cmd
        }
    })
    

    let sendMessageResult
    switch(data) {
        case('show_all_todos'):
            responseData = await TodoService.showAllTodos(chatId)
            
            return bot.send(chatId, responseData.responseText, responseData.options)
        case('start_creating_todo'):
            responseData = await TodoService.startCreatingTodo(chatId)

            return await bot.send(chatId, responseData.responseText, responseData.options)

            // TODO_update_msg_id
        case('cancel_creating_todo'):
            await UserStateService.deleteUserState(chatId, 'create_todo')
            
            return bot.send(chatId, 'Если хочешь, можем и не создавать задачу. У меня ведь ещё есть как тебе угодить!')
        case(BUTTONS_DATA.DELETE_TODO_TEXT_CMD):
            responseData = await TodoService.deleteTodoText(actualUserState, msg.from.username)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case('set_standard_todo_text'):
            responseData = await UserStateService.setStandardTodoText(actualUserState._id)

            sendMessageResult = await bot.send(chatId, responseData.responseText, responseData.options)

            // TODO_update_msg_id
            return calendar.startNavCalendar(message)
        case('delete_all_todos'):
            responseData = await TodoService.deleteAllTodos(chatId)

            return bot.send(chatId, responseData.responseText)
        case(BUTTONS_DATA.SHOW_TODO_CMD):
            responseData = await TodoService.showTodo(todoId)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case(BUTTONS_DATA.COMLETE_TODO_CMD):
            responseData = await TodoService.changeCompleted(todoId, true)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case(BUTTONS_DATA.UNCOMPLETE_TODO_CMD):
            responseData = await TodoService.changeCompleted(todoId, false)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case(BUTTONS_DATA.CONTINUE_CREATING_TODO_CMD):
            return calendar.startNavCalendar(message)
        case(BUTTONS_DATA.CHANGE_TODO_TEXT_CMD):
            responseData = await TodoService.changeTodoText(chatId, todoId)

            return bot.send(chatId, responseData.responseText, responseData.options)
            // TODO_update_msg_id
        default:
            return bot.send(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
    }
}