import { getTimeOfDay } from "../helpers"
import { TodoType } from "../infrastructure/TodoType"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"

export const BotService = {
    start(): { stickerURL: string, responseText: string } {
        return {
            stickerURL: 'https://tlgrm.ru/_/stickers/364/159/364159a8-d72f-4a04-8aa1-3272dd144b06/4.webp',
            responseText: 'Привет, красотка! Я самый льстивый бот в телеграме. Если хочешь чтобы я радовал тебя коплиментами ежедневно - подпишись на рассылку командой /register'
        }
    },

    getCompliment(): Promise<{ responseText: string }> {
        return ComplimentsRepository.getRandomCompliment()
    },

    createTodo(todo: TodoType) {
        
    },

    info(currentUserDate: number, username: string): { responseText: string } {
        const timeOfDay = getTimeOfDay(currentUserDate)

        return { responseText: `Ты всегда так нежно спрашиваешь у меня информацию... Сейчас ${timeOfDay} и твоё прекрасное имя - ${username}!` }
    },
}