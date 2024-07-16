import { use } from "chai";
import { Ticket } from "../../Database/Schematics/Ticket.js";
import * as TicketModule from "../../Database/Schematics/Ticket.js";
import { expressServer, database } from "../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../utility.js";
import { IntegratedAccount } from "../../Database/Schematics/IntegratedAccount.js";
import { Transaction } from "../../Database/Schematics/Transaction.js";

expressServer.use_cors(false);
/* USER ACCOUNT ENTITY  ROUTE */

expressServer.router('app').post('/Account/Create/AllProfiles', CreateAllProfiles)
export async function CreateAllProfiles(req, res){
    res.send("Endpoint exists but isn't implemented");
}


expressServer.router('app').post('/createUser', CreateUser)
async function CreateUser(req, res){
    let email = req.query.email
    let password = req.query.password
    
    let details = {
        UserID:req.query.userid,
        Address:req.query.address,
        Email:email,
        Password:password
    }

    let response = await database.eventgo_schema().EventGoUser(details).Create();
    console.log(response)
    if(response != false){console.log("created user successfully"); res.send("created user successfully")}
    else{console.log("couldn't create user"); res.send("couldn't create user")}
}


expressServer.router('app').post('/deleteUser', DeleteUser)
expressServer.router('app').post('/deleteUserByEmailAndPass', DeleteUser)
expressServer.router('app').get('/deleteUser', DeleteUser)
expressServer.router('app').get('/deleteUserByEmailAndPass', DeleteUser)
async function DeleteUser(req, res){
    let email = req.query.email
    let password = req.query.password
   
    let user = await database.eventgo_schema().EventGoUser({Email:email, Password:password})
    let success = await user.GetUserByEmailAndPass()
    if(success == false){res.send("No user to delete"); return false}

    let exists = await user.Exists();

    if(exists == true){
        let response = await user.Delete();
        if(response == true){res.send("User deleted")}
        else{res.send("Couldn't delete user")}
        return;
    }
    res.send("User already doesn't exist to delete")
}


expressServer.router('app').post('/deleteUserByAccessToken', DeleteUserWithAccessToken)
expressServer.router('app').get('/deleteUserByAccessToken', DeleteUserWithAccessToken)
async function DeleteUserWithAccessToken(req, res){
    let access_token = req.query.access_token
    let user_data = await database.supabase_client().auth.getUser(access_token)
   
    user_data = user_data.data.user
    console.log(user_data)
    let user = await database.eventgo_schema().EventGoUser({UserID:user_data.id})
    await user.Synchronize()

    let response = await user.Delete();

    if(response == true){res.send("User deleted")}
    else{res.send("Couldn't delete user")}
}


expressServer.router('app').post('/updateUser', UpdateUser)
expressServer.router('app').get('/updateUser', UpdateUser)
async function UpdateUser(req, res){
    let data = {Email:req.query.email, Password:req.query.pass, Address:req.query.address,  UserID:req.query.userid}
    let success = await database.eventgo_schema().EventGoUser(data).Update()
    if(success){res.send("User updated"); return true;}
    res.send("Couldn't update user")
}

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


/* BUSINESS ACCOUNT ENTITY ROUTE*/
expressServer.router('app').post('/createBusiness/EmailAndPass', CreateBusiness)
expressServer.router('app').get('/createBusiness/EmailAndPass', CreateBusiness)
async function CreateBusiness(req, res){
    //This endpoint creates ALL 3 Entities at same time. It assumes that business and regular account will be 
    //merged together. Note this contraint may not exist in future

    //NOTE: This endpoint must have a check that if same user tries to create same account it will refuse it
    //There probably is a check I just don't know much tbh.
    let success = await database.eventgo_schema().SupaUser(req.body.supa_user).Create();
    if(success == false){res.send("Couldn't signup user"); return false;}

    let user_data = await GetUserByEmailAndPass(req.body.supa_user.email, req.body.supa_user.password)
    req.body.eventgo_user.userid = user_data.id
    let eventgo = req.body.eventgo_user
    let data = {Email:eventgo.email, Password:eventgo.password, Address:eventgo.address,  UserID:eventgo.userid}

    let busi = req.body.business
    busi.ID = eventgo.userid

    let success1 = await database.eventgo_schema().EventGoUser(data).Create();
    let success2 = await database.eventgo_schema().Business(req.body.business).Create();

    res.send(String(success + success1 + success2)+" entities created")

}

expressServer.router('app').post('/createBusiness/LinkToAccount', LinkAndCreateBusiness)
expressServer.router('app').get('/createBusiness/LinkToAccount', LinkAndCreateBusiness)
async function LinkAndCreateBusiness(req, res){
    let business_body = req.body.business
    let user = req.body.user
    business_body.ID = user.ID

    //Check if the user exists in either tables
    let User = await database.eventgo_schema().SupaUser(user)
    let user_exists = await User.Exists();
    if(user_exists == false){res.send("User doesn't exist in database"); return false}

    //Check if the business account exists already
    let business_acc = await database.eventgo_schema().Business(business_body)
    let exists = await business_acc.Exists();
    if(exists == true){res.send("Business Profile already exists"); return}
    
    //Link the account here by creating new business account with same UUID
    business_acc.SetAttributes(business_body);
    let created = await business_acc.Create();  
    if(created == false){res.send("Couldn't create business profile for linking"); return false}
    res.send("Business profiled created and linked")
}   

expressServer.router('app').post('/findUser', SearchUser)
expressServer.router('app').get('/findUser', SearchUser)
async function SearchUser(req, res){
    let user = await database.eventgo_schema().U(req.body)
    let result = await business.Search();
    res.json(result)
}


expressServer.router('app').post('/deleteBusiness', DeleteBusiness)
expressServer.router('app').get('/deleteBusiness', DeleteBusiness)
async function DeleteBusiness(req, res){
    let business_body = req.body.business

    //Check if the business account exists already
    let business_acc = await database.eventgo_schema().Business(business_body)
    let exists = await business_acc.Exists();
    if(exists == false){res.send("Business Profile already doesn't exist"); return}
    
    //Delete the account here
    business_acc.SetAttributes(business_body);
    let deleted = await business_acc.Delete();  
    if(deleted == false){res.send("Couldn't delete business profile"); return false}
    res.send("Business profiled deleted")
}   


expressServer.router('app').post('/UpdateBusiness', UpdateBusiness)
expressServer.router('app').get('/UpdateBusiness', UpdateBusiness)
async function UpdateBusiness(req, res){
    let business_body = req.body.business

    //Check if the business account exists already
    let business_acc = await database.eventgo_schema().Business(business_body)
    let exists = await business_acc.Exists();
    if(exists == false){res.send("Business Profile doesn't exist"); return}
    
    //Update the account here by same UUID
    business_acc.SetAttributes(business_body);
    let updated = await business_acc.Update();  
    if(updated == false){res.send("Couldn't update business profile"); return false}
    res.send("Business profiled updated")
} 



/* TICKET ENTITY ROUTE */
expressServer.router('app').post('/createTicket', CreateTicket)
expressServer.router('app').get('/createTicket', CreateTicket)
async function CreateTicket(req, res){
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


/* TICKET ENTITY ROUTE */
expressServer.router('app').post('/NewCreateTicket', NewCreateTicket)
expressServer.router('app').get('/NewCreateTicket', NewCreateTicket)
async function NewCreateTicket(req, res){

    let ticket = new Ticket(req.body)
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

expressServer.router('app').post('/findTicket', SearchTicket)
expressServer.router('app').get('/findTicket', SearchTicket)
async function SearchTicket(req, res){
    let ticket = await database.eventgo_schema().Ticket(req.body)
    let result = await ticket.Search();
    res.json(result)
}



/* SHOW ENTITY ROUTE */
expressServer.router('app').get('/createShow', CreateShow)
expressServer.router('app').post('/createShow', CreateShow)
async function CreateShow(req, res){
    //Create business object
    let business = await database.eventgo_schema().Business(req.body.business)
    let busi_exists = await business.Exists();

    //If business account doesn't exist then don't proceed further
    if(busi_exists == false){res.send("Business Account is required to create or host shows"); return false;}

    //Synchronize data between object and the database entry
    let synced = await business.Synchronize()
    console.log("EventGoBusiness Object synchronized")

    //Create show object 
    let show = await database.eventgo_schema().Show(req.body.show)
    let show_exists = await show.Exists();

    //If show already doesn't exist then create the show
    let success = null
    if(show_exists == false){success = await show.Create();}
    else{res.send("Show already exists"); return false;}

    if(success){res.send("Show has been created"); console.log("Show has been created"); return true}
    res.send("Couldn't create show");
    console.log("Couldn't create show")

    return false;
}


expressServer.router('app').get('/cancelShow', CancelShow)
expressServer.router('app').post('/cancelShow', CancelShow)
async function CancelShow(req, res){
  
    //Create show object 
    let show = await database.eventgo_schema().Show(req.body.show)
    let show_exists = await show.Exists();
    //If show doesn't already exist just return
    if(show_exists == false){res.send("Show doesn't exist to delete"); return false}

    //Cancel the show when it exists.
    let success = await show.Delete();
    if(success == true){res.send("cancelled show successfully"); return true}
    else {res.send("Couldn't cancel the show")}

    return false;
}

expressServer.router('app').post('/updateShow', UpdateShow)
expressServer.router('app').get('/updateShow', UpdateShow)
async function UpdateShow(req, res){
     //Create show object 
     let show = await database.eventgo_schema().Show(req.body.show)
     let show_exists = await show.Exists();

     //If show doesn't already exist just return
     if(show_exists == false){res.send("Show doesn't exist to update"); return false}
 
     //Update the show when it exists.
     let success = await show.Update();
     if(success == true){res.send("updated show successfully"); return true}
     else {res.send("Couldn't update the show")}
 
     return false;
}

expressServer.router('app').get('/findShow', SearchShow)
expressServer.router('app').post('/findShow', SearchShow)
async function SearchShow(req, res){
    let show = await database.eventgo_schema().Show(req.body)
    let result = await show.Search();
    res.json(result)
}



/*********************PROFILE ENTITY ROUTES***********/
function ValidField(field){
    let empty = {}
    return (field != undefined && field != null && field != empty)
}

function ProfileManager(supa_user_data, eventgo_user_profile, business_profile, stripe_profile){
    try{
        if(business_profile.Address !== eventgo_user_profile.Address){
            return {success:false, error:"business and user address must match same string"}
         }
        eventgo_user_profile.ID = supa_user_data.id
        eventgo_user_profile.Email = supa_user_data.email
        eventgo_user_profile.Passowrd = supa_user_data.password

        business_profile.ID = supa_user_data.id

        stripe_profile.business_profile.name = business_profile.Name
        stripe_profile.business_profile.support_address = business_profile.Address
        stripe_profile.business_profile.support_email = eventgo_user_profile.Email
        return {success:true, error:null, data:[supa_user_data, eventgo_user_profile, business_profile, stripe_profile]}
    }catch(error){return {success:false, error:"Maybe some fields are missing!"}}
}


 //TESTING NEEDED
expressServer.router('app').post('/IntegratedAccount/Create', CreateProfile)
async function CreateProfile(req, res){
    
    let eventgo_user_profile = req.body.eventgo_user
    let business_profile = req.body.business
    let stripe_profile = req.body.stripe
    let access_token = req.body.access_token

    //If the the incoming fields are incorrect
    if(ValidField(eventgo_user_profile) + ValidField(business_profile) + ValidField(stripe_profile) < 3){
        let response = ServerResponse("One of the profile section is incorrect")
        response.set_not_sucess(""); res.send(response.get()); return false;
    }

    //Further checking if the profiles have missing fields or something
    let supa_user_data = GetUserByAccessToken(access_token)
    let response_val = ProfileManager(supa_user_data, eventgo_user_profile, business_profile, stripe_profile)
    if(response_val.success == false){let Res = new ServerResponse(response_val.error); Res.set_not_sucess(""); res.json(Res.get()); return false;}


    //If the main user profile already exits then it's assumed every other profile also exists therefore the don't create anymore
    let ev_already_exists = await database.eventgo_schema().EventGoUser(eventgo_user_profile).Exists();
    if(ev_already_exists){
        let response = new ServerResponse("account profile already exists")
        response.set_not_sucess("profile already exists"); res.send(response.get()); return false;
    }

    let stripe_acc = await database.eventgo_schema().StripeAccount(stripe_profile)
    let stripe_created = await stripe_acc.Create();

    //NOTE: StripeAccIDs can't be nullable and must be unique.
    eventgo_user_profile.StripeAccID = stripe_created.data.id
    business_profile.StripeAccID = stripe_created.data.id

    let ev_user = await database.eventgo_schema().EventGoUser(eventgo_user_profile)
    let ev_user_created = await ev_user.Create();

    let business = await database.eventgo_schema().Business(business_profile)
    let business_created = business.Create();

    if(stripe_created == false || ev_user_created == false || business_created == false){
        let stripe_deleted = await stripe_acc.Delete();
        let ev_user_deleted = await ev_user.Delete();
        let business_deleted = await business.Delete();

        let resp = ServerResponse('Failed to create atleast one profile therefore deleted all profiles')
        resp.set_not_sucess("Behavior is programmed delete all profiles user, business and stripe if any of them fail to be created")
        res.json(resp.get());
        return false;
    }
    //Final syncing for all entities before sending latest data 
    await ev_user.Synchronize();
    await business.Synchronize();
    await stripe_acc.Synchronize();

    let user_profile = {
        eventgo_user:ev_user.Attributes(),
        business:business.Attributes(),
        stripe:stripe_acc.Attributes()
    }
    let resp = ServerResponse(user_profile)
    resp.set_not_sucess("All profiles created successfully")
    res.json(resp.get());
    return true;
}

 //TESTING NEEDED
expressServer.router('app').post('/IntegratedAccount/Delete', CreateUserProfile)
async function CreateUserProfile(req, res){
    let eventgo_user_profile = req.body.eventgo_user
    let business_profile = req.body.business
    let stripe_profile = req.body.stripe
    let access_token = req.body.access_token

    //If the the incoming fields are incorrect
    if(ValidField(eventgo_user_profile) + ValidField(business_profile) + ValidField(stripe_profile) < 3){
        let response = ServerResponse("One of the profile section is incorrect")
        response.set_not_sucess(""); res.send(response.get()); return false;
    }

    var IntegratedAcc = new IntegratedAccount(access_token, eventgo_user_profile, business_profile, stripe_profile)
    let response = await IntegratedAcc.Delete();
    if(response.error == true){
        let resp = ServerResponse(response.details)
        resp.set_not_sucess(); res.json(resp.get()); return false;
    }

    let resp = ServerResponse('All connected profiles are deleted')
    resp.set_sucess(); res.json(resp.get()); return false;
}

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