import express from 'express';
import cors  from 'cors';

export class ExpressServer{

    constructor(){
        //default port
        this._host_port = 8080
        this._app = express();
        this._cors = false;
        this._app.use(express.json())
        this._router = express.Router();

        this._available_routers = {
            app:{router_object:this._app, in_use:false},
            router1:{router_object:express.Router(), in_use:false, router_url:null},
            router2:{router_object:express.Router(), in_use:false, router_url:null}

        }
    }

    app(){
        return this._app;
    }

    router(selection){
        if(selection === 'app'){return this._app}
        
        let in_use = this._available_routers[selection].in_use
        if(in_use == false){
            this._available_routers[selection].in_use = true;
            let router_url = this._available_routers[selection].router_url
            if(router_url == null || router_url == undefined || router_url == ""){
                this._app.use(this._available_routers[selection].router_object)
            }
            else{
                this._app.use(router_url, this._available_routers[selection].router_object)
            }
           
        }
        return this._available_routers[selection].router_object
    }

    update_router(name, attributes){
        /*
        let keys = Object.keys(attributes)
        let keys_len = Object.keys(attributes).length

        let router = this._available_routers[name]
        for (let i = 0; i < keys_len; i++){
            router[keys[i]] = attributes[keys[i]]
        }*/

    }

    create_router(name){
        //Doesn't work
        this._available_routers[name] = "WOWWWW"
        console.log("HEREE", this._available_routers)
    }
    
    delete_router(name){
        delete this._available_routers[name]
    }

    use_cors(value){
        //Enable the cors policy
        if(value){
            this._cors = true;
            return true;
        }

        //Disable the cors policy
        this._app.use(cors());
        this._cors = false;
        return false;
    }

    set_port(port_num){
        //PUT a check for decimal incase
        this._host_port = port_num
    }

    start(){
        this._app.listen(this._host_port, ()=>{
            console.log(" Base Express Server: Running", " ON PORT:", this._host_port)
        })
    }

}