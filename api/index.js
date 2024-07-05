import { Access, Payment, Authenticator, EventGo} from "../Server/Handlers/handlers";
import { expressServer } from "../Server/server_tools";


expressServer.set_port(3000)
expressServer.use_cors(false)
expressServer.start()
module.exports = expressServer.app()