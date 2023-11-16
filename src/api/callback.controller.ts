import { bot, calendar } from "../main"
import { UserStateService } from "../application/userState.service"
import { TodoService } from "../application/todo.serivce"
import { BUTTONS_DATA } from "../constants"
import { BasicUserStateService } from "../application/BasicUserState.serivce"
import { HandlerType, processUpdate } from "../middlewares/processUpdate.middleware"
import { getTodoId } from "../helpers"

export async function callbackController(msg: any) { 
    const message = msg.message
    const { data } = getTodoId(msg.data)
    let handler: HandlerType
    
    let sendMessageResult
    switch(data) {
        case('show_all_todos'):
            handler = TodoService.showAllTodos
            break;
        case('start_creating_todo'):
            handler = TodoService.startCreatingTodo
            break;
        case('cancel_creating_todo'):
            handler = UserStateService.deleteCreateTodoState
            break;
        case(BUTTONS_DATA.DELETE_TODO_TEXT_CMD):
            handler = TodoService.deleteTodoText
            break;
        case('set_standard_todo_text'):
            handler = UserStateService.setStandardTodoText
            break;
        case('delete_all_todos'):
            handler = TodoService.deleteAllTodos
            break;
        case(BUTTONS_DATA.SHOW_TODO_CMD):
            handler = TodoService.showTodo
            break;
        case(BUTTONS_DATA.COMLETE_TODO_CMD):
            handler = TodoService.completeTodo
            break;
        case(BUTTONS_DATA.UNCOMPLETE_TODO_CMD):
            handler = TodoService.unCompleteTodo
            break;
        case(BUTTONS_DATA.CONTINUE_CREATING_TODO_CMD):
            return calendar.startNavCalendar(message)
        case(BUTTONS_DATA.CHANGE_TODO_TEXT_CMD):
            handler = TodoService.changeTodoText
            break;
        case(BUTTONS_DATA.CONFIRM_FIRST_NAME_CMD):
            handler = (msg: any, chatId: number) => {
                const responseData = BasicUserStateService.confirmFirstName(msg.basicUserState.name)
                return bot.send(chatId, responseData.responseText, responseData.options)
            }
            break;
        case(BUTTONS_DATA.REJECT_FIRST_NAME_CMD):
            handler = async (msg: any, chatId: number) => {
                const responseData = await BasicUserStateService.rejectName(chatId)
                return bot.send(chatId, responseData.responseText)
            }
            break;
        case(BUTTONS_DATA.SELECT_RU_LANG_CMD):
            handler = async (msg: any, chatId: number) => {
                const responseData = await BasicUserStateService.selectLang(chatId, 'ru', msg.basicUserState.name)
                return bot.send(chatId, responseData.responseText, responseData.options)
            }
            break;
        case(BUTTONS_DATA.SELECT_EN_LANG_CMD):
            handler = async (msg: any, chatId: number) => {
                const responseData = await BasicUserStateService.selectLang(chatId, 'en', msg.basicUserState.name)
                return bot.send(chatId, responseData.responseText, responseData.options)
            }
        case(BUTTONS_DATA.SELECT_MALE_SEX_CMD):
            handler = async (msg: any, chatId: number) => {
                const responseData = await BasicUserStateService.selectSex(chatId, 'male')
                return bot.send(chatId, responseData.responseText)
            }
        case(BUTTONS_DATA.SELECT_FEMALE_SEX_CMD):
            handler = async (msg: any, chatId: number) => {
                const responseData = await BasicUserStateService.selectSex(chatId, 'female')
                return bot.send(chatId, responseData.responseText)
            }
        case(BUTTONS_DATA.SELECT_OTHER_SEX_CMD):
            handler = async (msg: any, chatId: number) => {
                const responseData = await BasicUserStateService.selectSex(chatId, 'other')
                return bot.send(chatId, responseData.responseText)
            }
        default:
            handler = async (msg: any, chatId: number) => {
                const actualUserState = await UserStateService.findActualUserState(chatId)

                if(!actualUserState) {
                    return bot.send(chatId, 'Я готов выполнить любые твои желания... впрочем, этого действия я не знаю')
                }
            }
            break;
    }
    processUpdate(msg, handler)
}