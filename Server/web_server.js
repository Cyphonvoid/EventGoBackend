//import 'dotenv/config'
//require('dotenv').config(); //for netlify
import { expressServer } from "./server_tools.js";
import * as RouteHandlers from "./Handlers/handlers.js"
import * as webhooks from "./Webhooks/webhooks.js"



const PORT = 8888
const CORS = false;

expressServer.use_cors(CORS)
expressServer.set_port(PORT)
expressServer.router('app')
expressServer.start()