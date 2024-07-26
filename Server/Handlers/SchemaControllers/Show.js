import { use } from "chai";
import { expressServer, database } from "../../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../../utility.js";
import { Show } from "../../../Database/Schematics/Show.js";

expressServer.use_cors(false);

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