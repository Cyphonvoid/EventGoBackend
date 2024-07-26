import { use } from "chai";
import { expressServer, database } from "../../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../../utility.js";
import { StripeAccount } from "../../../Database/Schematics/Stripe.js";
import stripe from "../../../Database/Schematics/StripeConnect.js";

expressServer.use_cors(false);

expressServer.router('app').post('/createStripeAccount', CreateStripeAccount)
async function CreateStripeAccount(req, res){
    let stripe_profile = req.body
    let resp = new ServerResponse();

    let stripe_acc = await database.eventgo_schema().StripeAccount(stripe_profile)
    let response = await stripe_acc.Create();
    console.log(response)
    if(response.created == false){resp.set_response("Couldn't create stripe account"); resp.set_not_sucess(""); 
        res.json(resp.get()); return false;
    }

    resp.set_response("Successfully created the stripe account");
    resp.set_success("");
    res.json(resp.get());
    return true;
}

expressServer.router('app').post('/deleteStripeAccount', DeleteStripeAccount)
async function DeleteStripeAccount(req, res){
    let stripe_profile = req.body
    let resp = new ServerResponse()

    let stripe_acc = await database.eventgo_schema().StripeAccount(stripe_profile)
    let exists = await stripe_acc.Exists();
    if(exists == false){
        resp.set_response("Stripe account doesn't exists"); resp.set_not_sucess("");
        res.json(resp.get()); return false;
    }

    let response = await stripe_acc.Delete();
    if(response.deleted == false){
        resp.set_response("Couldn't delete the stripe account");
        resp.set_not_sucess("Might be fatal error!");
        res.json(resp.get()); return false;
    }
    resp.set_response("Successfully deleted the stripe account");
    resp.set_not_sucess("");
    res.json(resp.get());
    return true;
    return true;
}

expressServer.router('app').post('/updateStripeAccount', updateStripeAccount)
async function updateStripeAccount(req, res){
    let stripe_profile = req.body
    let resp = new ServerResponse()

    let stripe_acc = await database.eventgo_schema().StripeAccount(stripe_profile)
    let exists = await stripe_acc.Exists();
    if(exists == false){
        resp.set_response("Stripe account  doesn't exists"); resp.set_not_sucess("");
        res.json(resp.get()); return false;
    }

    let response = await stripe_acc.Update();
    if(response.updated == false){
        resp.set_response("Couldn't update the stripe account");
        resp.set_not_sucess("Might be fatal error!");
        res.json(resp.get()); return false;
    }
    resp.set_response("Successfully update the stripe account");
    resp.set_not_sucess("");
    res.json(resp.get());
    return true;
}

expressServer.router('app').post('/searchStripeAccount', SearchStripeAccount)
async function SearchStripeAccount(req, res){
    let stripe_profile = req.body
    let resp = new ServerResponse();

    let stripe_acc = await database.eventgo_schema().StripeAccount(stripe_profile)
    let exists = await stripe_acc.Exists();
    if(exists == false){
        resp.set_response("Stripe account doesn't exists");
        resp.set_not_sucess("");
        res.json(resp.get())
        return false;
    }

    let synced = await stripe_acc.Synchronize();
    if(!synced){resp.set_response("Failed to sync and fetch stripe account data"); resp.set_not_sucess(""); res.json(resp.get()); return false;}

    resp.set_response(stripe_acc.Attributes());
    res.json(resp.get());
    return true;
}