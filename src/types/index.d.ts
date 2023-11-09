import { BasicUserStateType } from "./UserStateType";

import { Message } from 'node-telegram-bot-api';

// Расширение интерфейса Message
declare module 'node-telegram-bot-api' {
    interface Message {
        userState: BasicUserStateType | null;
    }
}