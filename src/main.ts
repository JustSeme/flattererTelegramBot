require('dotenv').config()
import { start } from "./api/commands.controller";
import { runDB } from "./infrastructure/db";

start()
runDB()