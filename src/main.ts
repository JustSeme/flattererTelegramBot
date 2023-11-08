require('dotenv').config()
import { runDB } from "./infrastructure/db";
import Calendar from 'telegram-inline-calendar'
import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
import { TodosQueryRepository } from "./infrastructure/todos.query-repository";
import { messagesController } from "./api/messages.controller";
import { commonCommands } from "./constants";
import { callbackController } from "./api/callback.controller";
import { UserStateService } from "./application/userState.service";

const token = process.env.TELEGRAM_BOT_TOKEN
class MyBot extends TelegramBot {
    constructor(token: string, options) {
        super(token, options);
    }
    
    async send(chatId: number, text: string, options?: SendMessageOptions) {
        const actualUserState = await UserStateService.findUserState(chatId)

        if(actualUserState && actualUserState.botMsgId) {
            await bot.deleteMessage(chatId, actualUserState.botMsgId)
        }
        return bot.sendMessage(chatId, text, options)
    }

    async sendWithSaveMsgId(chatId: number, text: string, options?: SendMessageOptions) {

    }
}
export const bot = new MyBot(token, { polling: true })

export const calendar = new Calendar(bot, {
    date_format: 'DD.MM.YYYY/HH',
    language: 'ru',
    start_date: new Date(),
    time_selector_mod: true,
    time_step: '1h',
});

const start = () => {
    bot.setMyCommands(commonCommands)

    bot.on('message', messagesController)

    bot.on('callback_query', callbackController);

    setInterval(async () => {
        const todosForNotify = await TodosQueryRepository.getTodosForNotify()
    
        for(const todo of todosForNotify) {
            const notifyText = `Счастлив уведомить вас, ${todo.firstName}, что пришло время выполнить задачу ${todo.todoText}!\n`
            await bot.send(todo.chatId, notifyText)
        }
    }, 3600000) // ever hour
}

runDB()
start()