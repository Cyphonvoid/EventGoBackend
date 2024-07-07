import { expressServer, database } from "../server_tools.js";

expressServer.use_cors(false);

expressServer.router('app').get('/addPaymentMethod', AddPaymentMethod)
expressServer.router('app').post('/addPaymentMethod', AddPaymentMethod)
async function AddPaymentMethod(req, res){
    let user = await database.eventgo_schema().EventGoUser(req.body.user)
}
