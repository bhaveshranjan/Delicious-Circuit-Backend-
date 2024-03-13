import { Request, Response, NextFunction } from 'express'
import { CreateVendorInput } from '../dto'
import { GeneratePassword, GenerateSalt } from '../utility';
import {Vendor} from '../models'


export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {

    const { name, address, pincode, foodType, email, password, ownerName, phone }  = <CreateVendorInput>req.body;
    


    const existingVendor = await Vendor.findOne({email: email})
    if(existingVendor !== null){
        return res.json({ "message": "A vendor is exist with this email ID"})
    }


    //generate a salt

    const salt =  await GenerateSalt()
    const userPassword = await GeneratePassword(password, salt);

    // encrypt the password using the salt
    

    const CreateVendor =  await Vendor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        salt: salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        lat: 0,
        lng: 0
    })

    return res.json(CreateVendor)

}


export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {

}

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {

}