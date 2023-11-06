export type UserStateType = CreateTodoStateType

export type CreateTodoStateType = {
    chatId: number
    todoText: string | null
    todoDate: string | null
    todoTime: string | null
    messageThread: 'create_todo'
}

export type MessageThreadType = 'create_todo'