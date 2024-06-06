const crypto = require("crypto");
const {v4: uuidv4} =  require('uuid')

function generateUUID(){
    let empid = uuidv4()
    return empid
}

function encryptPassword(password, uuid){
    try{
        let encryptPassword = crypto.createHmac('sha256', uuid).update(password).digest('hex')
        return encryptPassword
    }
    catch(e){
        return ("Failed to encrypt password")
    }
}

function checkPassword(password, uuid, encryptedPassword){
    let check = encryptPassword(password,uuid)
    if (check == encryptedPassword){
        return true;
    } else {
        return false;
    }
}

module.exports = { generateUUID, checkPassword, encryptPassword };
