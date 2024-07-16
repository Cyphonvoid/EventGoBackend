import * as crypto from "crypto"

export class Flag{
    constructor(value=false){
        this.value = value
    }
    set_false(){this.value=false}
    set_true(){this.value=true}
    check(){return this.value}
}


export class Encryptor{

    constructor(){
        this._message = null;
        this._key = null;
        
    }

    Message(value){
        this._message = value;
    }

    Encrypt(message){

    }

    DefineKey(key){

    }
}
