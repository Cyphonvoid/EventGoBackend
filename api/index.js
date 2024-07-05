//import { Access, Payment, Authenticator, EventGo} from "../Server/Handlers/handlers.js";
import { Root, Login, SignUp } from "../Server/Handlers/handlers2.js";
import { expressServer } from "../Server/server_tools.js";


expressServer.set_port(3000)
expressServer.use_cors(false)
expressServer.router('app')
expressServer.start()
export default expressServer.app()