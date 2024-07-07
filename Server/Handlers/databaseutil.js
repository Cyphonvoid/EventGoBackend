import { expressServer } from "../server_tools";

expressServer.use_cors(false);
expressServer.router('app').get('/synchronizeSchematic', DatabaseSchematic)
expressServer.router('app').post('/synchronizeSchematic', DatabaseSchematic)
async function DatabaseSchematic(req, res){
    /**
     * This is a secure private admin endpoint. Updates the schematic model 
     * used on server under Schematics folder to reflect changes made in the
     * model present in database. If any attributes are changed in any of 
     * entities such as User, Show and etc it will be automatically updated on
     * server as well. 
     * 
     * [STATUS]: Endpoint isn't active currently. Need for this may not be present.
     */
}