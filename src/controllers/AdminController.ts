import { Request, Response, NextFunction } from 'express'
import { CreateVendorInput } from '../dto'
import { GeneratePassword, GenerateSalt } from '../utility';
import {Transaction, Vendor} from '../models'
import { findAncestor } from 'typescript';
import { DeliveryUser } from '../models/DeliveryUser';

export const FindVendor = async (id:string | undefined, email ?: string) =>{
    if(email){
        return await Vendor.findOne({email: email})
    }else{
        return await Vendor.findById(id)
    }
}

export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {

    const { name, address, pincode, foodType, email, password, ownerName, phone }  = <CreateVendorInput>req.body;
    


    const existingVendor = await FindVendor('',email);
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
        foods: [],
        lat: 0,
        lng: 0
    })

    return res.json(CreateVendor)

}


export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {
 const Vendors = await Vendor.find()
 if(Vendors !== null){
    return res.json(Vendors)
 }
 return res.json({"Message" : "Vendors data not available"})
}

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {

    const VendorId = req.params.id;

    const vendor = await FindVendor(VendorId);

    if(vendor !== null){
        return res.json(vendor);
    }

    return res.json({"message": "Vendors data is not avaialable"})
}

export const GetTransactions = async (req: Request, res: Response, next: NextFunction) => {

    const transactions = await Transaction.find();

    if(transactions){
        return res.status(200).json(transactions);
    }

    return res.json({"message": "Vendors data is not avaialable"})
}

export const GetTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id; 

    const transactions = await Transaction.findById(id);

    if(transactions){
        return res.status(200).json(transactions);
    }

    return res.json({"message": "Vendors data is not avaialable"})
}

export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction) =>{

    const { _id, status} = req.body;

    if(_id){

        const profile = await DeliveryUser.findById(_id);

        if(profile){

            profile.verified = status;

            const result = await profile.save();

            return res.status(200).json(result);
        }
    }

    return res.status(400).json({"message": "Unable to delivery user"})

}

export const GetyDeliveryUsers = async (req: Request, res: Response, next: NextFunction) =>{

    

        const deliveryUsers = await DeliveryUser.find();

        if(deliveryUsers){


            return res.status(200).json(deliveryUsers);
        }

    return res.status(400).json({"message": "Unable to Get delivery Users"})

}