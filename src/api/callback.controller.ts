import { bot, calendar } from "../main"
import { UserStateService } from "../application/userState.service"
import { TodoService } from "../application/todo.serivce"
import { BUTTONS_DATA, commandsWithId } from "../constants"
import { BasicUserStateService } from "../application/BasicUserState.serivce"
import { HandlerType } from "../middlewares/processUpdateMessage.middleware"
import { TodoUserStateType } from "../types/UserStateType"
import { processUpdateQuery } from "../middlewares/processUpdateQuery.middleware"

export async function callbackController(msg: any) { 
    const message = msg.message
    const userState = msg.userState
    let data = msg.data
    let handler: HandlerType

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
            handler = TodoService.showAllTodos
            break;
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
        case(BUTTONS_DATA.CONFIRM_FIRST_NAME_CMD):
            responseData = BasicUserStateService.confirmFirstName(userState.name)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case(BUTTONS_DATA.REJECT_FIRST_NAME_CMD):
            responseData = await BasicUserStateService.rejectName(chatId)

            return bot.send(chatId, responseData.responseText)
        case(BUTTONS_DATA.SELECT_RU_LANG_CMD):
            responseData = await BasicUserStateService.selectLang(chatId, 'ru', userState.name)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case(BUTTONS_DATA.SELECT_EN_LANG_CMD):
            responseData = await BasicUserStateService.selectLang(chatId, 'en', userState.name)

            return bot.send(chatId, responseData.responseText, responseData.options)
        case(BUTTONS_DATA.SELECT_MALE_SEX_CMD):
            responseData = await BasicUserStateService.selectSex(chatId, 'male')

            return bot.send(chatId, responseData.responseText)
        case(BUTTONS_DATA.SELECT_FEMALE_SEX_CMD):
            responseData = await BasicUserStateService.selectSex(chatId, 'female')

            return bot.send(chatId, responseData.responseText)
        case(BUTTONS_DATA.SELECT_OTHER_SEX_CMD):
            responseData = await BasicUserStateService.selectSex(chatId, 'other')

            return bot.send(chatId, responseData.responseText)
        default:
            
            if(!actualUserState) {
                return bot.send(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
            }
    }
    processUpdateQuery(msg, handler)
}