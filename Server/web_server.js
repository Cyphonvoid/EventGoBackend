//import 'dotenv/config'
//require('dotenv').config(); //for netlify
import * as RouteHandlers from "./Handlers/handlers.js"
import { expressServer } from "./server_tools.js";



const PORT = 8888
const CORS = false;

expressServer.update_router('router1', {router_url:"/Database/Netlify"})
expressServer.use_cors(CORS)
expressServer.set_port(PORT)
expressServer.start()