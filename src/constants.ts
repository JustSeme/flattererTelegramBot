
export const commonCommands = [
    { command: '/start', description: 'Приветствие' },
    { command: '/todo', description: 'Задачи' },
    { command: '/info', description: 'Получить информацию' },
    { command: '/compliment', description: 'Получить случайный комплиент' },
]

export const BUTTONS_DATA = {
    SHOW_ALL_TODOS_CMD: 'show_all_todos', SHOW_ALL_TODOS_TXT: 'Мои задачи',
    START_CREATING_TODO_CMD: 'start_creating_todo', START_CREATING_TODO_TXT: 'Создать задачу',
    DELETE_ALL_TODOS_CMD: 'delete_all_todos', DELETE_ALL_TODOS_TXT: 'Удалить все задачи',
    CANCEL_CREATING_TODO_CMD: 'cancel_creating_todo', CANCEL_CREATING_TODO_TXT: 'Я передумал создавать задачу',
    DELETE_TODO_TEXT_CMD: 'delete_todo_text', DELETE_TODO_TEXT_TXT: 'Хочу изменить текст задачи',
    SET_STANDARD_TODO_TEXT_CMD: 'set_standard_todo_text', SET_STANDARD_TODO_TEXT_TXT: 'Стандартный',
    CONTINUE_CREATING_TODO_CMD: 'coninue_creating_todo', CONTINUE_CREATING_TODO_TXT: 'Вернуться к созданию задачи'
}