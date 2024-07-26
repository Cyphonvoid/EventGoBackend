import { use } from "chai";
import { Ticket } from "../../Database/Schematics/Ticket.js";
import * as TicketModule from "../../Database/Schematics/Ticket.js";
import { expressServer, database } from "../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../utility.js";
import { IntegratedAccount } from "../../Database/Schematics/IntegratedAccount.js";
import { Transaction } from "../../Database/Schematics/Transaction.js";

expressServer.use_cors(false);
/* USER ACCOUNT ENTITY  ROUTE */

expressServer.router('app').post('/GetUser', GetUser)
expressServer.router('app').get('/GetUser', GetUser)
async function GetUser(req, res){

    //If access_token is available
    if(req.body.access_token != undefined && req.body.access_token != null && req.body.access_token != ""){
        let user_data = await database.supabase_client().auth.getUser(req.body.access_token)
        if(user_data != undefined && user != null){res.json(user_data); return true;}
    }

    //Using email and pass
    else if(req.body.id != undefined && req.body.id != null && req.body.id != ""){
        let user_data = await database.supabase_client().auth.signInWithPassword({email:req.body.email, password:req.body.password})
        if(user_data != null && user_data != undefined){res.json(user_data); return true}
    }

    else{
        let empty = {}
        res.json(empty)
        return false;
    }
}

expressServer.router('app').post('/GetEventGoUserProfile', EventGoUserProfile)
async function EventGoUserProfile(req, res){
    let ev_user_profile = req.body

    let ev_user = await database.eventgo_schema().EventGoUser(ev_user_profile)
    let exists = ev_user.Exists();
    if(exists == false){
        let resp = new ServerResponse("EventGoUser profile doesn't exist with specified ID");
        resp.set_not_sucess(); res.json(resp.get()); return false;
    }

    let synced = ev_user.Synchronize();
    if(synced == false){
        let resp = ServerResponse("Failed to fetch and sync EventGo user profile")
        resp.set_not_sucess(); res.json(resp.get()); return false;
    }

    let resp = new ServerResponse(ev_user.Attributes())
    resp.set_success("");
    return true;
}



expressServer.router('app').post('/GetBusinessProfile', GetBusinessProfile)
async function GetBusinessProfile(req, res){
    let business_body = req.body.ID

    let business = await database.eventgo_schema().EventGoBusiness(business_body)
    let exists = business.Exists();

    if(exists == false){
        res.send("Business with the specified ID doesn't exist")
        return false;
    }
    //Sync in the data for sending it
    let synced = await business.Synchronize();
    if(synced == false){
        let resp = ServerResponse("Coldn't fetch the business data from database")
        resp.set_not_sucess(""); return false;
    }

    let business_attributes = business.Attributes();
    let resp = ServerResponse(business_attributes)
    resp.set_success();
    res.json(resp.get());
    return true;
}

expressServer.router('app').post('/IssueTicket', IssueTicket)
expressServer.router('app').get('/IssueTicket', IssueTicket)
async function IssueTicket(req, res){
    let show = await database.eventgo_schema().Show(req.body.show)
    let success = await show.Synchronize();

    if(success == false){
        let exists = await show.Exists();
        if(exists == false){res.send("In order to create ticket A Show needs to be hosted"); return false}
    }

    req.body.ticket.ID = req.body.show.ID
    let ticket = await show.Ticket(req.body.ticket)
    let ticket_success = await ticket.Create();

    if(ticket_success == true){res.send("Ticket created successfullyy"); return true}
    res.send("Couldn't Create ticket")
    return false;
}

expressServer.router('app').post('/Ticket/GenerateQRToken', GenerateQRToken)
async function GenerateQRToken(req, res){
    let new_ticket = new Ticket(req.body)
    let exists = await new_ticket.Exists()

    let proc_ticket = new TicketModule.ProcessedTicket(req.body)
    let proc_exists = await proc_ticket.Exists();
    if(exists == false && proc_exists == false){res.send("Ticket doesn't exists");return false;}

    let ticket = exists == false ? proc_ticket : new_ticket
    //Sync in all the data if it exists
    let synced = await ticket.Synchronize();
    let attributes = ticket.Attributes();

    let token_data = {
        ID:attributes.ID,
        BusinessOwnerID:attributes.BusinessOwnerID,
        TicketID:attributes.TicketID
    }

    attributes.QRToken = JSON.stringify(token_data)
    ticket.SetAttributes(attributes)

    let updated = await ticket.Update();

    if(updated == false){
        res.send("Couldn't generate QR Token for the ticket")
        return false;
    }
    res.send({"message":"QR Token successfully generated", "data":attributes.QRToken})
    return true;
}


expressServer.router('app').post('/cancelTicket', CancelTicket)
expressServer.router('app').get('/cancelTicket', CancelTicket)
async function CancelTicket(req, res){

    //A show object must exists which alreaady contains the ticket
    let show = await database.eventgo_schema().Show(req.body.show)

    //Synchronizing the data using unique identifiers such ID provided in req.body.show
    let success = await show.Synchronize();
    if(success == false){
        let exists = await show.Exists();
        if(exists == false){res.send("In order to cancel ticket A Show needs to be hosted"); return false}
    }

    //Creat the ticket object here in order to check and cancel
    let ticket = await show.Ticket(req.body.ticket)
    let exists = await ticket.Exists();
    if(exists == false){res.send("Ticket already doesn't exists"); return false;}

    let ticket_success = await ticket.Delete();
    if(ticket_success == true){res.send("Ticket cancelled successfullyy"); return true}
    res.send("Couldn't cancel the ticket")
    return false;
}


expressServer.router('app').post("/buyTicket", BuyTicket)
expressServer.router('app').get("/buyTicket", BuyTicket)
async function BuyTicket(req, res){
    
    //Fetch user details
    let access_token = null;
    try{
       let user = req.body.user; let ticket = req.body.ticket; access_token = req.body.user.access_token; let ticket_id = req.body.ticket.TicketID; 
       let id = req.body.ticket.ID; let data = [user, ticket, access_token, ticket_id, id]
       for(let i = 0; i < data.length; i++){if(data[i] === undefined){throw new Error("Required fields missing")}}
    }
    catch(error){
        res.send("ERROR: Some fields are missing required structure is { user:{access_token}, ticket:{ID:null, TicketID:null, ....} }");
        return false;
    }
    
    console.log(access_token)
    if(access_token === null || access_token === "" || access_token === undefined){res.send("ERROR: Please provide a access token"); return false}
    let user_data = await GetUserByAccessToken(access_token)
    if(user_data === null || user_data === false || user_data === undefined){res.send("ERROR: access_token is invalid. Couldn't get userdata"); return false}

    
    //Make the user buy ticket
    let user = await database.eventgo_schema().EventGoUser(user_data)
    let ticket_details = req.body.ticket
    let bought = await user.ReserveTicket(ticket_details)
    //NOTE: BuyTicket already syncs the ticket, and checks existence of ticket as well.
    if(bought.success == false){
        res.json({success:false, reason:bought.reason, user:user_data})
        return false;
    }

    let ticket = bought.data;
    //Freshly resyncing to get latest data
    let fresh_sync = await ticket.Synchronize();             
    if(!fresh_sync){res.send("Error: Couldn't fresh sync ticket data"); return false}
    
    //Push the ticket to stripe processing queue
    ticket_details = ticket.Attributes(); 
    let pushed = await database.eventgo_schema().ProcessedTicket(ticket_details).Create();
    if(!pushed){res.send("Couldn't push ticket to stripe processing queue"); return false;}
    
    res.send("pushed ticket to stripe processing queue")
    return true;
   
}


expressServer.router('app').get('/GetStripeProfile', GetStripeProfile)
async function GetStripeProfile(req, res){
    let stripe_basic_profile = req.body
    let stripe_acc = await database.eventgo_schema().StripeAccount(stripe_basic_profile)
    let exists = await stripe_acc.Exists();
    let resp = new ServerResponse()
    if(exists == false){resp.set_not_sucess(""); resp.SetAttributes("Failed to retrieve stripe profile with given ID"); 
    res.json(resp.get()); return false}

    let synced = await stripe_acc.Synchronize();
    if(synced == false){
        resp.SetAttributes("Failed to sync and fetch stripe account data"); resp.set_not_sucess();
        return false;
    }

    resp.SetAttributes(stripe_acc.Attributes());
    resp.set_success();
    res.json(resp.get());
    return true;
}


/*********************PROFILE ENTITY ROUTES***********/


 //TESTING NEEDED
expressServer.router('app').post('/Profile/EventGoUser/Update', EventGoUserUpdate)
async function EventGoUserUpdate(req, res){

    //contains the user id as well
    let ev_user_profile = req.body.eventgo_user

    let ev_user = await database.eventgo_schema().EventGoUser(ev_user_profile);
    let exists = await ev_user.Exists();
    if(exists == false){res.send("Account already dodesn't exists to update"); return false;}

    let synced = await ev_user.Synchronize();
    let updated = await ev_user.Update();

    if(updated){
        let resp = ServerResponse('Profile successfully updated');
        resp.set_succes("");
        res.json(resp);
        console.log("updated:", updated, " synced:", synced)
        return true;
    }

    let resp = ServerResponse("Profile couldn't be  updated");
    resp.set_not_sucess("");
    res.json(resp);
    console.log("updated:", updated, " synced:", synced)
    return false;
}



//TESTING NEEDED
expressServer.router('app').post('/Profile/EventGoBusiness/Update', EventGoBusinessUpdate)
async function EventGoBusinessUpdate(req, res){
    //contains the user id as well
    let business_profile = req.body.business
    let business = await database.eventgo_schema().EventGoBusiness(business_profile)
    let exists = await business.Exists();
    if(exists == false){res.send("Business account already doesn't exists to update"); return false;}

    let synced = await business.Synchronize();
    let updated = await business.Update();

    if(updated){
        let resp = ServerResponse('Profile successfully updated');
        resp.set_succes("");
        res.json(resp);
        console.log("updated:", updated, " synced:", synced)
        return true;
    }

    let resp = ServerResponse("Profile couldn't be  updated");
    resp.set_not_sucess("");
    res.json(resp);
    console.log("updated:", updated, " synced:", synced)
    return false;
}


//TESTING NEEDED
expressServer.router('app').post('/Profile/Stripe/Update', StripeUpdate)
async function StripeUpdate(req, res){
    //contains the user id as well
    let stripe_profile = req.body.stripe

    let stripe = await database.eventgo_schema().StripeAccount(business_profile)
    let exists = await stripe.Exists();
    if(exists == false){res.send("Account profile already doesn't exists"); return false;}
   
    let synced = await stripe.Synchronize();
    stripe.SetAttributes(stripe_profile)
    let updated = await stripe.Update();
    
    if(updated){
        let resp = ServerResponse('Profile successfully updated');
        resp.set_succes("");
        res.json(resp);
        console.log("updated:", updated, " synced:", synced)
        return true;
    }

    let resp = ServerResponse("Profile couldn't be updated");
    resp.set_not_sucess("");
    res.json(resp);
    console.log("updated:", updated, " synced:", synced)
    return false;
}


/**QR CODE ROUTES */
expressServer.router('app').post('/validateQRcodeToken', ValidateQRcode)
async function ValidateQRcode(req, res){
    /**
     * Function assumes that transactions in the table can only exist if stripe transaction was successfull
     */
    let qr_token = req.body.qr_token
    var object = JSON.parse(qr_token)

    let ticket = new Ticket(object)
    let exists = ticket.Exists();
    let synced = await ticket.Synchronize();
    let ticket_data = ticket.Attributes();
    if(exists == false){res.send("requested validation failed"); return false;}

    let transaction = new Transaction({TransactionID:object.TransactionID, ID:object.ID})
    let tran_exists = await transaction.Exists();
    let tran_synced = await transaction.Synchronize();
    let tran_attr = transaction.Attributes();

    if(tran_attr.TicketID == ticket_data.TicketID && ticket_data.TransactionID == tran_attr.TransactionID){
        res.send("validation success!");
        return true;
    }
    res.send("requested validation failed!");
    return false;
}



expressServer.router('app').post('/GetTicketQRcode', GetTicketQRcode)
async function GetTicketQRcode(req, res){
    /**
     * Requires ticket ID to fetch the associated QR code
     * NOTE: This function assumed that QR code will be stored in a separate table
     */
    let ticket_body = req.body
    let ticket = await database.eventgo_schema().Ticket(ticket_body)
    let exists = await ticket.Exists();
    if(exists == false){res.send("Ticket doesn't exist with the ID"); return false}

    let {error, data} = await database.supabase_client().from("TicketQRCodes").select().eq('ID', ticket_body.ID)
    if(data != null && data != undefined && data.length > 0){
        res.send(data.EncryptedToken);
        return true;
    }

    res.send("Error fetching associated QR code for given ticket ID "+String(ticket_body.ID))
    return true;
}

/***EXTRA ROUTES***/

//TESTING NEEDED
expressServer.router('app').post('/User/PurchasedTickets', UserPurchasedTickets)
async function UserPurchasedTickets(req, res){
    //returns all the tickets associated with user
    let user_profile = req.body.eventgo_user    
    let ev_user = await database.eventgo_schema().EventGoUser(user_profile)

    let exists = await ev_user.Exists();
    if(exists == false){
        let resp = new ServerResponse("User doesnt exists")
        resp.set_not_sucess(""); return false;
    }

    let ev_user_attr = ev_user.Attributes();
    let {error, data} = await database.supabase_client().from('ProcessedTickets').select().eq('ID', ev_user_attr.ID)
    if(data != null && data != undefined && data.length > 0){
        res.json(data);
        return true;
    }

    let resp = new ServerResponse("User doesn't have any processed purchased tickets yet")
    resp.set_not_sucess("");
    return false;
}

//TESTING NEEDED
expressServer.router('app').post('/Business/ActiveTickets', BusinessActiveTickets)
async function BusinessActiveTickets(req, res){
    let business_body = req.body.business

    let business = await database.eventgo_schema('EventGoBusiness').EventGoBusiness(business_body)

    let exists = await business.Exists();
    if(exists == false){
        let resp = new ServerResponse("Business doesnt exists")
        resp.set_not_sucess(""); return false;
    }

    let business_id = business.Attributes().ID
    let {error, data} = await database.supabase_client().from('Tickets').select().eq('ID', business_id)
    if(data != null && data != undefined && data.length > 0){
        res.json(data);
        return true;
    }

    let resp = new ServerResponse("Business doesn't have any active tickets yet")
    resp.set_not_sucess("");
    return false;
}