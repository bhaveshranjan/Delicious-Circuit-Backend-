import express, {Request, Response, NextFunction} from 'express';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';
import { CreateDeliveryUserInputs ,UserLoginInputs, EditCustomerProfileInputs, OrderInputs, CartItem} from '../dto';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer, Food, Offer, Vendor,Transaction } from '../models';
import { Order } from '../models/Order';
import { DeliveryUser } from '../models/DeliveryUser';

export const DeliveryUserSignup = async (req: Request, res: Response, next: NextFunction) =>{
    const deliveryUserInput = plainToClass(CreateDeliveryUserInputs, req.body)
    const inputErrors = validate(deliveryUserInput,{validationError: {target : true}});


    const {email, phone, password, address, firstName, lastName, pincode} = deliveryUserInput;
   
    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword( password, salt)
    

    const existingDeliveryUser = await DeliveryUser.findOne({email: email, phone: phone})

    if(existingDeliveryUser !== null){
        return res.status(409).json({message:'A Delivery user exist with the provided Email or Phone'})
    }

    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        firstname: firstName,
        lastname: lastName,
        address: address,
        pincode: pincode,
        verified: false,
        lat: 0,
        lng: 0,
        isAvailable: false
    })
    if(result){

        
        // generate the signature
        const signature = GenerateSignature({
            _id: result._id,
            email:result.email,
            verified: result.verified
        })
        //send the result to client
        return res.status(201).json({signature: signature, verified: result.verified,email: result.email});
    }
    return res.status(400).json({message: "Error with signup"})
}

export const DeliveryUserLogin = async (req: Request, res: Response, next: NextFunction) => {

    
    const loginInputs = plainToClass(UserLoginInputs, req.body);

    const loginErrors = await validate(loginInputs, {validationError: { target: false}})

    if(loginErrors.length > 0){
        return res.status(400).json(loginErrors);
    }

    const { email, password } = loginInputs;
    const deliveryUser = await DeliveryUser.findOne({ email: email});
    if(deliveryUser){
        const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt);
        
        if(validation){

            const signature = GenerateSignature({
                _id: deliveryUser._id,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })

            return res.status(200).json({
                signature,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })
        }
    }

    return res.status(404).json({ message: 'Error With Login'});

}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) =>{
const {otp} = req.body;
const customer = req.user;

if(customer){
    const profile = await Customer.findById(customer._id)

    if(profile){
        if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date())
{
    profile.verified = true;
    const updatedCustomerResponse = await profile.save();

    const signature = GenerateSignature({
        _id: updatedCustomerResponse._id,
        email: updatedCustomerResponse.email,
        verified: updatedCustomerResponse.verified
    });

    return res.status(201).json({
        signature: signature,
        verified: updatedCustomerResponse.verified,
        email: updatedCustomerResponse.email
    });
}    }
}
return res.status(400).json({message: 'Error with verifying ... (SignUp)'})
}


export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) =>{
    const deliveryUser = req.user;

        
        if(deliveryUser){
            const profile = await Customer.findById(deliveryUser._id)

            if(profile){


                return res.status(200).json(profile)
            }
        }
    return res.status(400).json({message: 'Error with Fetchin Data'})

}

export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) =>{
    const deliveryUser = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

    const profileErrors = await validate(profileInputs, {validationError: {target : false}})

    if(profileErrors.length > 0){
        return res.status(400).json(profileErrors);
    }
    const { firstName, lastName, address} = profileInputs; 
        if(deliveryUser){
            const profile = await Customer.findById(deliveryUser._id)

            if(profile){

                profile.firstName = firstName;
                profile.lastName = lastName;
                profile.address = address;


                const result = await profile.save();
                await profile.save();

                res.status(200).json({profile})
            }
        }
        return res.status(400).json({message: 'Error with Fetchin Data'})
    }

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {


    const deliveryUser = req.user;

    if(deliveryUser){

        const {lat, lng} = req.body;

        const profile = await DeliveryUser.findById(deliveryUser._id);
        if(profile){

            if(lat & lng){
                profile.lat = lat;
                profile.lng = lng;
               
            }

            profile.isAvailable = !profile.isAvailable;

            const result = await profile.save();

            return res.status(200).json(result);
        }
    }
    return res.status(400).json({message: 'Error with  Update status'})
}