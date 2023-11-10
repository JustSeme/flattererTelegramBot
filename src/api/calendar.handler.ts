import { TodoService } from "../application/todo.serivce";
import { UserStateService } from "../application/userState.service";
import { bot, calendar } from "../main";

export async function calendarHandler(msg: any, chatId: number) {
    const message = msg.message
    const actualUserState = await UserStateService.findActualUserState(chatId)
    let responseData

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
}