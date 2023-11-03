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

export function getWordByNumber(n: number, text_forms: string[]) {  
    n = Math.abs(n) % 100; 
    var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 === 1) { return text_forms[0]; }
    return text_forms[2];
}