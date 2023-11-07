export type UserStateType = CreateTodoStateType | ChangeTodoTextStateType

export type CreateTodoStateType = {
    chatId: number
    todoText: string | null
    messageThread: 'create_todo'
}

export type ChangeTodoTextStateType = {
    chatId: number
    todoText: string | null
    todoId: string | null
    messageThread: 'change_todo_text'
}

export type MessageThreadType = 'create_todo' | 'change_todo_text'