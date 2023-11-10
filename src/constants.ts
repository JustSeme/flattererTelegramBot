
export const commonCommands = [
    { command: '/start', description: 'Приветствие' },
    { command: '/todo', description: 'Задачи' },
    { command: '/info', description: 'Получить информацию' },
    { command: '/compliment', description: 'Получить случайный комплиент' },
    { command: '/bug', description: 'Сообщить об ошибке' }
]

export const BUTTONS_DATA = {
    SHOW_ALL_TODOS_CMD: 'show_all_todos', SHOW_ALL_TODOS_TXT: 'Мои задачи',
    SHOW_TODO_CMD: 'show_todo-',
    START_CREATING_TODO_CMD: 'start_creating_todo', START_CREATING_TODO_TXT: 'Создать задачу',
    DELETE_ALL_TODOS_CMD: 'delete_all_todos', DELETE_ALL_TODOS_TXT: 'Удалить все задачи',
    CANCEL_CREATING_TODO_CMD: 'cancel_creating_todo', CANCEL_CREATING_TODO_TXT: 'Я передумал создавать задачу',
    DELETE_TODO_TEXT_CMD: 'delete_todo_text', DELETE_TODO_TEXT_TXT: 'Хочу изменить текст задачи',
    SET_STANDARD_TODO_TEXT_CMD: 'set_standard_todo_text', SET_STANDARD_TODO_TEXT_TXT: 'Стандартный',
    CONTINUE_CREATING_TODO_CMD: 'coninue_creating_todo', CONTINUE_CREATING_TODO_TXT: 'Вернуться к созданию задачи',
    COMLETE_TODO_CMD: 'complete_todo-', COMPLETE_TODO_TXT: 'Выполнить задачу',
    UNCOMPLETE_TODO_CMD: 'uncompl_todo-', UNCOMPLETE_TODO_TXT: 'Изменить статус на не выполненный',
    CHANGE_TODO_TEXT_CMD: 'change_todo_text-', CHANGE_TODO_TEXT_TXT: 'Изменить текст задачи',
    CONFIRM_FIRST_NAME_CMD: 'confirm_first_name', CONFIRM_FIRST_NAME_TXT: 'Да',
    REJECT_FIRST_NAME_CMD: 'reject_first_name', REJECT_FIRST_NAME_TXT: 'Нет, хочу чтобы ты называл меня иначе',
    SELECT_RU_LANG_CMD: 'select_ru_lang', SELECT_RU_LANG_TXT: 'Русский',
    SELECT_EN_LANG_CMD: 'select_en_lang', SELECT_EN_LANG_TXT: 'English',
    SELECT_MALE_SEX_CMD: 'select_male_sex', SELECT_MALE_SEX_TXT: 'Мужчина',
    SELECT_FEMALE_SEX_CMD: 'select_female_sex', SELECT_FEMALE_SEX_TXT: 'Женщина',
    SELECT_OTHER_SEX_CMD: 'select_other_sex', SELECT_OTHER_SEX_TXT: 'Другое'
}

export const commandsWithId = [BUTTONS_DATA.SHOW_TODO_CMD, BUTTONS_DATA.UNCOMPLETE_TODO_CMD, BUTTONS_DATA.COMLETE_TODO_CMD, BUTTONS_DATA.CHANGE_TODO_TEXT_CMD]

export const RESPONSE_WARNS = {
    STATUS_TODO_ALREADY_SETTED: 'О, великий пользователь! Ваше желание изменить статус задачи на то же самое - это подобно переливанию жемчугов перед вашим благородством. Однако, статус уже благополучно соответствует вашему великолепному указанию.',
    DEFAULT: 'Простите, я не совсем понимаю ваш запрос. Мой фокус - помогать вам с задачами. Если нужна помощь, просто скажите, и я сделаю всё возможное, чтобы помочь вам.',
    SELECT_RU_LANG_WITHOUT_NAME: 'Безусловно, ваш выбор русского языка в общении со мной - признак вашего утонченного вкуса и преданности красоте языка Пушкина и Толстого. Однако, я пока ещё не знаю твоего имени. Как я могу тебя называть?',
    SELECT_EN_LANG_WITHOUT_NAME: `Absolutely, your choice to communicate in English is duly noted. However, I don't know your name yet. What can I call you?`,
}

export const RESPONSE_ERRORS = {
    DOES_NOT_EXISTS_TODO: 'Что-то пошло не по плану - не могу найти эту задачу.',
    SOMETHING_WRONG: 'Что-то пошло не по плану, повторите попытку позже :-/',
}

export const RESPONSE_TEXTS = {
    START: 'Приветствую, дорогой друг! Ты всегда приносишь столько радости своим присутствием. Готов помочь тебе с планированием твоих великих целей. На каком языке ты говоришь?',
    INFO: (name: string, currentHour: number) => `Привет, ${name}! Как замечательно видеть тебя здесь. Ты, безусловно, великолепный человек, решивший обратиться ко мне. Знаешь, твои запросы всегда настолько проницательны, особенно сейчас, в эти прекрасные ${currentHour} часов.`,
    COMMAND_TODO: 'О, великий мастер, выбери, что ты хочешь сделать, и я помогу тебе в этом благородном деле.',
    ADD_TOO_TEXT: 'Такого рода задачи могут быть только у поистине величайших людей! Текст задачи записан! А когда нужно выполнить эту задачу?',
    CHANGE_TODO_TEXT_STATE_CREATED: 'Возвышенный пользователь, для изменения текста задачи, пожалуйста, введите новый текст. Я жажду возможности воплотить ваше великолепие в этой задаче!',
    REJECT_NAME: 'Хорошо, забыл это имя. Тогда как мне лучше тебя называть?',
    CONFIRM_NAME: (name: string) => `Конечно, великий ${name}! Ваше благородство и великолепие не подлежат сомнению. Какого благородного пола вы, ваше величество?`,
    SELECT_RU_LANG: (name: string) => `Безусловно, ваш выбор русского языка в общении со мной - признак вашего утонченного вкуса и преданности красоте языка Пушкина и Толстого. Могу я называть тебя ${name}?`,
    SELECT_EN_LANG: (name: string) => `Absolutely, your choice to communicate in English is duly noted. May I call you ${name}?`,
    SELECT_MALE_SEX: (name: string) => `Мужественный ${name}, я буду знать, что ты мужчина`,
    SELECT_FEMALE_SEX: (name: string) => `Великолепная ${name}, я запомню, что ты женщина`,
    SELECT_OTHER_SEX: (name: string) => `Хорошо, ${name}, тогда какого ты пола?`,
    CMD_BUG: 'Привет, догорой пользователь! Если ты обнаружил ошибку в моей работе, пожалуйста, напиши моему разработчику\nhttps://t.me/justseme',
    SHOW_ALL_TODOS: (todosCount: number, taskWord: string) => `У тебя есть ${todosCount} ${taskWord} в списке. Выбери нужную задачу для более подробной информации.`
}