export type TodoUserStateType = CreateTodoStateType | ChangeTodoTextStateType

export type BasicUserStateType = {
    chatId: number
    sex: 'male' | 'female' | 'other' | null
    language: 'ru' | 'en'
    stateType: 'basic'
    name: string
}

export type CreateTodoStateType = {
    chatId: number
    todoText: string | null
    stateType: 'create_todo'
}

export type ChangeTodoTextStateType = {
    chatId: number
    todoText: string | null
    todoId: string | null
    stateType: 'change_todo_text'
}

export type StateType = 'create_todo' | 'change_todo_text'

export type BasicStateType = 'basic'