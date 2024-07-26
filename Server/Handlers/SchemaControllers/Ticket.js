import { Ticket, ProcessedTicket } from "../../../Database/Schematics/Ticket.js";
import { expressServer, database } from "../../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../../utility.js";

expressServer.use_cors(false);



/* TICKET ENTITY ROUTE */
expressServer.router('app').post('/createTicket', CreateTicket)
expressServer.router('app').get('/createTicket', CreateTicket)
async function CreateTicket(req, res){

    let ticket = new Ticket(req.body)
    let ticket_success = await ticket.Create();
    if(ticket_success == true){res.send("Ticket created successfullyy"); return true}
    res.send("Couldn't Create ticket")

    return false;
}

expressServer.router('app').post('/deleteTicket', CancelTicket)
expressServer.router('app').get('/cancelTicket', CancelTicket)
async function CancelTicket(req, res){

    //Creat the ticket object here in order to check and cancel
    let ticket = await show.Ticket(req.body)
    let exists = await ticket.Exists();
    if(exists == false){res.send("Ticket already doesn't exists"); return false;}

    let ticket_success = await ticket.Delete();
    if(ticket_success == true){res.send("Ticket cancelled successfullyy"); return true}
    res.send("Couldn't cancel the ticket")
    return false;
}

expressServer.router('app').post('/searchTicket', SearchTicket)
expressServer.router('app').get('/searchTicket', SearchTicket)
async function SearchTicket(req, res){
    let ticket = await database.eventgo_schema().Ticket(req.body)
    let result = await ticket.Search();
    res.json(result)
}