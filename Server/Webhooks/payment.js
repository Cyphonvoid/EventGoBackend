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
            res.send("Stripe transaction processing failed. Didn't create resources in database")
            return false;
        }

        //also AES encrypt the qr_token 
        let record = req.body.record
        let data = {/*Some filtered data from req.body + other things + qr_token + encrypted_aes_token*/
            BusinessID:record.BusinessID,
            TicketID:record.TicketID,
            ShowID:record.ShowID,
            TransactionID:null,
            EncryptedToken:"Akjhd8alka3A80JKFL2 fake token",
            TicketExpiry:null
        }
        
        let qr_generated = await database.eventgo_schema().TicketQRCode(data).Create();
        let deleted = await database.eventgo_schema().Ticket(req.body.record).Delete();
        //let deleted = true;
        if(queued + qr_generated != 2 && deleted == true){
            res.send("resource couldn't be created. Error occured while processing transactions")
            return false;
        }
        else{res.send("transaction completed, transaction status: "); return true}
}