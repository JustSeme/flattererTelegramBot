export type UserStateType = CreateTodoStateType

export type CreateTodoStateType = {
    userId: number
    todoText: string | null
    todoDate: string | null
    todoTime: string | null
    messageThread: 'create_todo'
}