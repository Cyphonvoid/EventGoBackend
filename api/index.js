import * as modules from "../Server/Handlers/handlers.js";
import { expressServer } from "../Server/server_tools.js";
import * as webhooks from "../Server/Webhooks/webhooks.js";

expressServer.set_port(3000)
expressServer.use_cors(false)
expressServer.router('app')
expressServer.start()
export default expressServer.app()