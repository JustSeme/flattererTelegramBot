
export const commonCommands = [
    { command: '/start', description: 'Приветствие' },
    { command: '/todo', description: 'Задачи' },
    { command: '/info', description: 'Получить информацию' },
    { command: '/compliment', description: 'Получить случайный комплиент' },
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
    CHANGE_TODO_TEXT_CMD: 'change_todo_text-', CHANGE_TODO_TEXT_TXT: 'Изменить текст задачи'
}

export const commandsWithId = [BUTTONS_DATA.SHOW_TODO_CMD, BUTTONS_DATA.UNCOMPLETE_TODO_CMD, BUTTONS_DATA.COMLETE_TODO_CMD, BUTTONS_DATA.CHANGE_TODO_TEXT_CMD]

export const RESPONSE_WARNS = {
    STATUS_TODO_ALREADY_SETTED: 'О, великий пользователь! Ваше желание изменить статус задачи на то же самое - это подобно переливанию жемчугов перед вашим благородством. Однако, статус уже благополучно соответствует вашему великолепному указанию.'
}

export const RESPONSE_ERRORS = {
    DOES_NOT_EXISTS_TODO: 'Что-то пошло не по плану - не могу найти эту задачу.',
    SOMETHING_WRONG: 'Что-то пошло не по плану, повторите попытку позже :-/',
}

export const RESPONSE_TEXTS = {
    COMPLETED_TODO: 'Задача успешно выполнена!',
    UNCOMPLETED_TODO: 'Статус успешно изменён на "Не выполнено"!',
    CHANGE_TODO_TEXT_STATE_CREATED: 'Возвышенный пользователь, для изменения текста задачи, пожалуйста, введите новый текст. Я жажду возможности воплотить ваше великолепие в этой задаче!',
    TEXT_TODO_CHANGED: 'Великий пользователь, ваше великолепие внесло изменения в текст текущей задачи! Она блестит новым великолепием, отражая ваше возвышенное величие. Я готов служить вам и вашему благородному творчеству!'
}