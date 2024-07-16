import { expressServer, database } from "../server_tools.js";

expressServer.use_cors(false);

expressServer.router('app').get('/addPaymentMethod', AddPaymentMethod)
expressServer.router('app').post('/addPaymentMethod', AddPaymentMethod)
export async function AddPaymentMethod(req, res){
    let user = await database.eventgo_schema().EventGoUser(req.body.user)
}


expressServer.router('app').post('/stripeTransaction', StripeGateway)
async function StripeGateway(req, res){

        console.log(req.body, "this is request body");
        //call the stripe api to process payment
        let stripe_response = true;

        if(stripe_response == false){
            let processed_ticket = await database.eventgo_schema().ProcessedTicket(req.body.record)
            let deleted = await processed_ticket.Delete();
            if(deleted){var response = " Ticket removed from processed_tickets table"}
            res.send("Stripe transaction processing failed. Didn't create resources in database" + response)
            return false;
        }

        let processed_ticket = await database.eventgo_schema().ProcessedTicket(req.body.record)
        let generated = await processed_ticket.GenerateTransaction();
        let deleted = await database.eventgo_schema().Ticket(req.body.record).Delete();
}