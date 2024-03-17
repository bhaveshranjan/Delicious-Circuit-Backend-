import express, {Request, Response, NextFunction} from 'express';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';
import { CreateCustomerInputs ,UserLoginInputs} from '../dto/Customer.dto';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer } from '../models';

export const CustomerSignup = async (req: Request, res: Response, next: NextFunction) =>{
    const customerInputs = plainToClass(CreateCustomerInputs, req.body)
    const inputErrors = validate(customerInputs,{validationError: {target : true}});

    const {email, phone, password} = customerInputs;
   
    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword( password, salt)
    const {otp, expiry} = GenerateOtp();

    const existCustomer = await Customer.findOne({email: email, phone: phone})

    if(existCustomer !== null){
        return res.status(409).json({message:'An user exist with the provided Email or Phone'})
    }
    console.log(otp, expiry);

    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry : expiry,
        firstname: '',
        lastname: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0
    })
    if(result){

        // send the OTP to customer
       await onRequestOTP(otp, phone)
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

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    
    const customerInputs = plainToClass(UserLoginInputs, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { email, password } = customerInputs;
    const customer = await Customer.findOne({ email: email});
    if(customer){
        const validation = await ValidatePassword(password, customer.password, customer.salt);
        
        if(validation){

            const signature = GenerateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified
            })

            return res.status(200).json({
                signature,
                email: customer.email,
                verified: customer.verified
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

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) =>{

    const customer = req.user;
    if(customer){

        const profile = await Customer.findById(customer._id)

        if(profile){
            const {otp, expiry} = GenerateOtp();
            profile.otp = otp;
            profile.otp_expiry = expiry;

            await profile.save();
            await onRequestOTP(otp, profile.phone);

            res.status(200).json({message: 'OTP sent to your Registered Phone number!'})
        }
    }
    return res.status(200).json({message: 'Error with Request OTP'})
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) =>{

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) =>{

}