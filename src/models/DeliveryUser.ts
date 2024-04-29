import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderDoc } from './Order';


interface DeliveryUserDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    pincode: string;
    phone: string;
    verified: boolean;
    lat: number;
    lng: number;
    isAvailable: boolean;
}


const DeliveryUserSchema = new Schema({
    email: {type: String, required: true},
    password:  {type: String, required: true},
    salt:  {type: String, required: true},
    firstName:  {type: String},
    lastName: {type: String},
    address: {type: String},
    pincode: {type: String},
    phone: {type: String, required: true},
    verified: {type: Boolean},
    lat: {type: Number},
    lng: {type: Number},
    isAvailable:{type: Boolean}

},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

        }
    },
    timestamps: true
});


const DeliveryUser = mongoose.model<DeliveryUserDoc>('deliveryUser', DeliveryUserSchema);

export { DeliveryUser }