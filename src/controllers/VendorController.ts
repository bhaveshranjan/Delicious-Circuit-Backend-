import{Request, Response, NextFunction} from 'express'
import { EditvendorInput, VendorLoginInputs, CreateFoodInput, CreateOfferInputs } from '../dto'
import { FindVendor } from './AdminController';
import { GeneratePassword, GenerateSignature, ValidatePassword } from '../utility';
import { Food ,Offer} from '../models';
import { Order } from '../models/Order';
import { Vendor } from '../models/Vendor';



export const VendorLogin = async (req: Request, res:Response, next: NextFunction)=>{
    const {email, password} = <VendorLoginInputs>req.body;

    const existingVendor = await FindVendor('',email);

    if(existingVendor !== null){
        //validation and give access
        const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt);
        if(validation){
            const signature = GenerateSignature({
                _id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            })
                return res.json(signature);
        }else{
            return res.json({"message":"Password is not valid"})
        }

    }

    return res.json({"message": "Login credential not valid"})
}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction)=>{
    const user = req.user;

    if(user){
        const existingVendor = await FindVendor(user._id)

        return res.json(existingVendor)
    }
    return res.json({"message":"Vendor Information Not Found"})
}

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction)=>{
    const {foodTypes, name, address, phone} = <EditvendorInput>req.body;
 
    const user = req.user;

    if(user){
        const existingVendor = await FindVendor(user._id)
        
        if(existingVendor !== null){
            existingVendor.name = name;
            existingVendor.address = address;
            existingVendor.phone = phone;
            existingVendor.foodType = foodTypes;
        }

        return res.json(existingVendor)
    }
    return res.json({"message":"Vendor Information Not Found"})
}

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction)=>{
    const user = req.user;

    if(user){
    const vendor = await FindVendor(user._id)

    if(vendor !== null){

        const files = req.files as [Express.Multer.File]

        const images = files.map((file: Express.Multer.File) => file.filename);
       
        vendor.coverImages.push(...images);
        
        const result = await vendor.save();

        return res.json(result);
    }
    }
    return res.json({"message":"Something wrong with adding this food"})
}
export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction)=>{
    const user = req.user;

    const {lat, lng} = req.body;

    if(user){
        const existingVendor = await FindVendor(user._id)
        if(existingVendor !== null){
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

            if(lat && lng){
                existingVendor.lat = lat;
                existingVendor.lng = lng;
            }
            const savedResult = await existingVendor.save()
            return res.json(savedResult);
        }

        return res.json(existingVendor)
    }
    return res.json({"message":"Vendor Information Not Found"})
}

export const AddFoods = async (req: Request, res: Response, next: NextFunction)=>{
    const user = req.user;

    if(user){
       const {name, description, category, foodType, readyTime, price} = <CreateFoodInput>req.body; 
    const vendor = await FindVendor(user._id)

    if(vendor !== null){

        const files = req.files as [Express.Multer.File]

        const images = files.map((file: Express.Multer.File) => file.filename);
        const createdfood = await Food.create({

            vendorId: vendor._id,
            name: name,
            description: description,
            category: category,
            foodType: foodType,
            images:images,
            readyTime: readyTime,
            price: price,
            rating: 0
        })
        vendor.foods.push(createdfood);
        const result = await vendor.save();

        return res.json(result);
    }
    }
    return res.json({"message":"Something wrong with adding this food"})
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction)=>{
    const user = req.user;

    if(user){
       const foods = await Food.find({ vendorId: user._id})

       if(foods !== null){
        return res.json(foods)
       }
    }
    return res.json({"message":"Food Information Not Found"})
}

export const GetCurrentOrders = async (req: Request, res: Response, next:NextFunction) =>{

    const user = req.user;

    if(user){

        const orders = await Order.find({vendorId: user._id});

        if(orders != null){
            return res.status(200).json(orders);
        }
    }
}

export const GetOrderDetails = async (req: Request, res: Response, next:NextFunction) =>{
    const orderId = req.params.id;

    if(orderId){

        const order = await Order.findById(orderId).populate('items.food');

        if(order != null){
            return res.status(200).json(order);
        }
    }
    
    return res.json({"message":"Order not found"})
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    const { status, remarks, time } = req.body;

    if (orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = status;
        order.remarks = remarks;
        if (time) {
            order.readyTime = time;
        }

        const orderResult = await order.save();

        if (orderResult != null) {
            return res.status(200).json(orderResult);
        }
    }

    return res.json({ message: 'Unable to process order' });
};

export const GetOffers = async(req: Request, res: Response, next: NextFunction)=>{

    const user = req.user;

    if(user){

        const offers = await Offer.find();
        let currentOffers = Array();

        if(offers){

           

            offers.map(item =>{
                if(item.vendors){
                    item.vendors.map(vendor =>{
                        if(vendor._id.toString()=== user._id){
                            currentOffers.push(item);
                        }
                    })
                }

                if(item.offerType === "GENERIC"){
                    currentOffers.push(item);
                }
            })
        }
        return res.json(currentOffers)
    }
    return res.json({"message": "offers not available"})
}

export const AddOffer = async(req: Request, res: Response, next: NextFunction)=>{
    const user = req.user;

    if(user){

        const { title, description, offerType, offerAmount, pincode,
        promocode,promoType, startValidity, endValidity, bank, bins, minValue, isActive} = <CreateOfferInputs> req.body;

        const vendor = await FindVendor(user._id);

        if(vendor){
            

            const offer = await Offer.create({
                title,
                description,
                offerType,
                offerAmount,
                pincode,
                promocode,
                promoType,
                startValidity,
                endValidity,
                bank,
                bins,
                isActive,
                minValue,
                vendors: [vendor]
            })
            console.log(offer);

            return res.status(200).json(offer);
        }

    }

    return res.json({"message": "unable to Add Offer"})

}

export const EditOffer = async(req: Request, res: Response, next: NextFunction)=>{
    
    const user = req.user;
    const offerId = req.params.id;

    if(user){

        const { title, description, offerType, offerAmount, pincode,
        promocode,promoType, startValidity, endValidity, bank, bins, minValue, isActive} = <CreateOfferInputs> req.body;

        const currentOffer = await Offer.findById(offerId);

        if(currentOffer){

            const vendor = await FindVendor(user._id);

            if(vendor){
            

                currentOffer.title = title,
                currentOffer.description = description,
                currentOffer.offerType = offerType,
                currentOffer.offerAmount = offerAmount,
                currentOffer.pincode = pincode,
                currentOffer.promocode = promocode,
                currentOffer.promoType = promoType,
                currentOffer.startValidity = startValidity,
                currentOffer.endValidity = endValidity,
                currentOffer.bank = bank,
                currentOffer.bins = bins,
                currentOffer.isActive = isActive,
                currentOffer.minValue = minValue

                const result = await currentOffer.save();

                return res.json(result);
                }
    
        }
        
    }
    return res.json({"message":"Unale to edit this offer"})
}