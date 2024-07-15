import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { SupabaseUser, EventGoUser, EventGoBusiness, CombinedUser, Transaction, Show, Ticket, ProcessedTicket, TicketQRCode, StripeAccount} from "./Schematics/schema.js"
import { SUPA_ANON_KEY, SUPA_SERVICE_KEY, SUPA_URL } from "./Schematics/Supabase.js";



export class DatabaseSchema{
    constructor(){

    }
    SupaUser(attributes){return new SupabaseUser(attributes);}
    EventGoUser(attributes){return new EventGoUser(attributes);}
    User(attributes){return new CombinedUser(attributes);}
    Business(attributes){return new EventGoBusiness(attributes);}
    Transaction(attributes){return new Transaction(attributes)}
    Show(attributes){return new Show(attributes)}
    Ticket(attributes){return new Ticket(attributes)}
    ProcessedTicket(attributes){return new ProcessedTicket(attributes)}
    TicketQRCode(attributes){return new TicketQRCode(attributes)}
    StripeAccount(attribbutes){return new Stripe(attribbutes)}
}

export class EventGoDatabase{

    constructor(){
        this.supa_database_client = createClient(SUPA_URL, SUPA_SERVICE_KEY)
        this.schema = new DatabaseSchema();
    }
    
    eventgo_schema(){
        return this.schema;
    }

    supabase_client(){
        return this.supa_database_client
    }

    refresh_supabase_client(){
        delete this.supa_database_client
        this.supa_database_client = createClient(SUPA_URL, SUPA_SERVICE_KEY)
    }
}