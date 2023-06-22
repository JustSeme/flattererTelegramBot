export function getTimeOfDay(date: number): string {
    const currentHour = new Date(date).getHours()
    if (currentHour >= 0 && currentHour <= 6) {
        return 'ночь'
    } else if (currentHour >= 6 && currentHour <= 12) {
        return 'утро'
    } else if (currentHour >= 12 && currentHour <= 18) {
        return 'день'
    } else if (currentHour >= 18 && currentHour <= 0) {
        return 'вечер'
    }
}

export function genRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min)
}