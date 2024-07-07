import { expressServer, database} from "../server_tools.js"


expressServer.use_cors(false);
expressServer.router('app').get('/confirmation', Confirmation)
expressServer.router('app').post('/confirmation', Confirmation)
export async function Confirmation(req, res){
    console.log(req, "/confirmation route:  Confirmation recieved")
    console.log(req.query)
    //Need an access token to identify which user's profile to create
    //let response = await database.eventgo_schema().EventGoUser().Create(req.query)

    //console.log(response, "/confirmation endpoint tracer")
    res.send("Confirmation endpoint reached")
}


expressServer.router('app').get('/verifyQRcode', VerifyQRcode)
async function VerifyQRcode(req, res){
    
}