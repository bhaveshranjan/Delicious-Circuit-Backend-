import express, {Request, Response, NextFunction} from 'express';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';
import { CreateCustomerInputs ,UserLoginInputs, EditCustomerProfileInputs, OrderInputs, CartItem} from '../dto/Customer.dto';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer, Food, Offer, Vendor,Transaction } from '../models';
import { Order } from '../models/Order';
import { DeliveryUser } from '../models/DeliveryUser';

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
        lng: 0,
        orders:[]
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
    const customer = req.user;

        
        if(customer){
            const profile = await Customer.findById(customer._id)

            if(profile){


                return res.status(200).json(profile)
            }
        }
    return res.status(400).json({message: 'Error with Fetchin Data'})

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) =>{
    const customer = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

    const profileErrors = await validate(profileInputs, {validationError: {target : false}})

    if(profileErrors.length > 0){
        return res.status(400).json(profileErrors);
    }
    const { firstName, lastName, address} = profileInputs; 
        if(customer){
            const profile = await Customer.findById(customer._id)

            if(profile){

                profile.firstName = firstName;
                profile.lastName = lastName;
                profile.address = address;


                const result = await profile.save();
                await profile.save();

                res.status(200).json({profile})
            }
        }
    }

//cart section

        export const AddToCart = async (req: Request, res:Response, next: NextFunction) => {

            const customer = req.user;
            // console.log(customer);
            if(customer){

                const profile = (await Customer.findById(customer._id))
                //console.log(profile);
                let cartItems = Array();

                const {_id, unit} = <CartItem>req.body;

                const food = await Food.findById(_id);
                
                if(food){
                    if(profile != null){

                        //check for cart items
                        cartItems = profile.cart;
                        console.log(cartItems);
                        if(cartItems.length > 0){
                            //check and update unit
                            let existFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);
                        
                            if(existFoodItem.length > 0){
                                const index = cartItems.indexOf(existFoodItem[0]);
                                if(unit>0){
                                    cartItems[index] = {food, unit};
                                }else{
                                    cartItems.splice(index, 1);
                                }
                            }else{
                                cartItems.push({ food, unit});
                            }
                        }else{
                            cartItems.push({food, unit});
                        }
                     if(cartItems.length > 0){
                        //check and update unit
                     }else{
                        //add new item to cart
                        cartItems.push({ food, unit});
                     }
                     if(cartItems){
                        profile.cart = cartItems as any;
                        const cartresult = await profile.save();
                        
                        return res.status(200).json(cartresult.cart);
                     }
                    }
                }

                

            }
                return res.status(400).json({message: 'unable to add in cart!'});
            
        }


        export const GetCart = async (req: Request, res:Response, next: NextFunction) =>{
            
            const customer = req.user;
            if(customer){

                const profile = (await Customer.findById(customer._id))
                if(profile){
                    return res.status(200).json(profile.cart);
                }
            }
            return res.status(400).json({message: 'cart is empty'});
        }


        export const DeleteCart = async (req: Request, res:Response, next: NextFunction) =>{
            
            const customer = req.user;
            if(customer){

                const profile = (await Customer.findById(customer._id))
                if(profile != null){

                    profile.cart = [] as any;
                    const cartResult = await profile.save();
                    return res.status(200).json(cartResult);
                }
            }
            return res.status(400).json({message: 'cart is already empty'});
        }
//create payment 


export const CreatePayment = async (req: Request, res: Response, next: NextFunction) =>{

    const customer = req.user;

    const { amount, paymentMode, offerId} = req.body;

    let payableAmount = Number(amount);

    if(offerId){

        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer){
            if(appliedOffer.isActive){
                payableAmount = (payableAmount - appliedOffer.offerAmount);
            }
        }
    }

    //perform Payment gateway charge API call

    //right after payment gateway success / failure response


    //Create record on Transaction

    const transaction = await Transaction.create({
        customer: customer._id,
        vendorId: '',
        orderId: '',
        orderValue: payableAmount,
        offerUsed : offerId || 'NA',
        status : 'OPEN',
        paymentMode : paymentMode,
        PaymentResponse : 'Payment is cash on delivery'
    })

    //return transaction ID
    return res.status(200).json(transaction);
}

//Delivery Notification

const assignOrderForDelivery = async (orderId: string, vendorId: string) =>{

    //find the vendor
    const vendor = await Vendor.findById(vendorId);

    if(vendor){
        const areaCode = vendor.pincode;
        const vendorLat = vendor.lat;
        const vendorlng = vendor.lng;

          //find the available Delivery Person
    const deliveryPerson = await DeliveryUser.find({ pincode: areaCode, verified: true, isAvailable: true});

    if(deliveryPerson){

        //check the nearest delivery person and assign the order

        const currentOrder = await Order.findById(orderId);

        if(currentOrder){
            //update deliveryID
            currentOrder.deliveryId = deliveryPerson[0]._id;
            await currentOrder.save();
            
            //Notify to vendor for recieved New Order using Firebase Push Notification
        }
    }
    


    }

  


    

    // update deliveryID
}

        //order section

        const validateTransaction = async (txnId: string) => {
            const currentTransaction = await Transaction.findById(txnId);
            if(currentTransaction){
                if(currentTransaction.status.toLowerCase() !== "failed"){
                    return {status: true,currentTransaction}
                }
            }
            return {status: false,currentTransaction}
        }

    export const CreateOrder = async (req: Request , res: Response, next: NextFunction)=>{
        // grab current login Customer
        const customer = req.user;

        const {txnId, amount, items} = <OrderInputs>req.body;

        if(customer){
          
          //validate Transaction
          const  {status, currentTransaction} = await validateTransaction(txnId);
          if(!status){
            return res.status(404).json({message : 'Error with Create Order'});
          }



          const profile = await Customer.findById(customer._id);

          const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

          let cartItems = Array();

          let netAmount = 0.0;
          let vendorId;

          //calculate order amount
            const foods = await Food.find().where('_id').in(items.map(item => item._id)).exec();

            foods.map(food =>{
                items.map(({ _id , unit})=>{

                    if(food._id == _id){
                        vendorId = food.vendorId;
                        netAmount += (food.price * unit);
                        cartItems.push({ food, unit})
                    }
                })
            })
          //Create order with Item description
            if(cartItems){
                //create order

                const currentOrder = await Order.create({
                    orderId : orderId,
                    vendorId: vendorId,
                    items: cartItems,
                    totalAmount: netAmount,
                    paidAmount : amount,
                    orderDate: new Date(),
                    orderStatus: 'waiting',
                    remarks: '',
                    deliveryId: '',
                    readyTime: 45,


                })

                profile.cart = [] as any;
                profile.orders.push(currentOrder)

                currentTransaction.vendorId = vendorId;
                currentTransaction.orderId = orderId;
                currentTransaction.status = 'CONFIRMED';

                await currentTransaction.save();

                assignOrderForDelivery(currentOrder._id, vendorId);
                

                const profileSaveResponse = await profile.save();

                res.status(200).json(profileSaveResponse);
            }
            else{
                return res.status(400).json({message: 'Unable to create order !'});   
            }
        }
    }

   export  const GetOrders = async (req: Request , res: Response, next: NextFunction)=>{
        const customer = req.user;
        if(customer){
            const profile = await Customer.findById(customer._id).populate("orders");

            if(profile){
                return res.status(200).json(profile.orders);
            }
        }
    }

    export const GetOrderById = async (req: Request , res: Response, next: NextFunction)=>{
        const orderId = req.params.id;

        if(orderId){
            const order = await Order.findById(orderId).populate("items.food");

            return res.status(200).json(order);
        }
    }

    export const verifyOffer = async (req: Request, res: Response, next: NextFunction) =>{

        const offerId = req.params.id;
        const customer = req.user;

        if(customer){

            const appliedOffer = await Offer.findById(offerId);
            if(appliedOffer){

                if(appliedOffer){

                    if(appliedOffer.promoType === "USER"){

                        //only can apply once per user
                    }else{
                        if(appliedOffer.isActive){
                            return res.status(200).json({ message: 'Offer is Valid', offer: appliedOffer})
                        }

                    }
                }

            
        }
    }

    return res.status(400).json({message : "Offer is not Valid"});
}

