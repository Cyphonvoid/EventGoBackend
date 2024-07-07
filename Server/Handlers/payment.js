import { expressServer, database } from "../server_tools.js";


expressServer.router('app').get('/addPaymentMethod', AddPaymentMethod)
async function AddPaymentMethod(req, res){
    let user = await database.eventgo_schema().EventGoUser(req.body.user)
}
