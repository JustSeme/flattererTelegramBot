import { getTimeOfDay } from "../helpers"
import { ComplimentsRepository } from "../infrastructure/compliments.repository"

export const BotService = {
    start(): { stickerURL: string, responseText: string } {
        return {
            stickerURL: 'https://tlgrm.ru/_/stickers/364/159/364159a8-d72f-4a04-8aa1-3272dd144b06/4.webp',
            responseText: 'Привет, я самый льстивый бот в телеграме. Если хочешь получать от меня регулярные комплименты - подпишись на рассылку командой /register'
        }
    },

    info(currentUserDate: number, username: string): { responseText: string } {
        const timeOfDay = getTimeOfDay(currentUserDate)

        return { responseText: `Сейчас ${timeOfDay} и тебя по прежнему зовут ${username}!` }
    },

    getCompliment(): Promise<{ responseText: string }> {
        return ComplimentsRepository.getRandomCompliment()
    }
}