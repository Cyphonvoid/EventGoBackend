import { expressServer, database } from "../server_tools.js";

expressServer.use_cors(false);

expressServer.router('app').get('/addPaymentMethod', AddPaymentMethod)
expressServer.router('app').post('/addPaymentMethod', AddPaymentMethod)
async function AddPaymentMethod(req, res){
    let user = await database.eventgo_schema().EventGoUser(req.body.user)
}



expressServer.router('app').post('/stripeTransaction', StripeGateway)
async function StripeGateway(req, res){

    let response = await database.eventgo_schema()
}