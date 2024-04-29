import mongoose, {Schema, Document, Model} from 'mongoose';

export interface OfferDoc extends Document{
    offerType: string; //VENDOR //GENERIC
    vendors:[any]; //['675876bjhgj6578]
    title:string; //INR 200 off on week days
    description: string; //any description with Terms and conditions
    minValue: number; //minimum order amount should 300
    offerAmount: number; //200
    startValidity: Date;
    endValidity: Date;
    promocode: string; // week200
    promoType: string; //USER  //ALL //BANK //CARD
    bank: [any];
    bins: [any];
    pincode: string;
    isActive: boolean;
        
}

const OfferSchema = new Schema({

    offerType: {type :String, required: true}, //VENDOR //GENERIC
    vendors:[
        {
            type: Schema.Types.ObjectId, ref:'vendor'
        }
    ],
    title: {type: String, require: true},
    description: {type: String},
    minValue: {type: Number, require: true},
    offerAmount: {type: Number, require: true},
    startValidity: Date,
    endValidity: Date,
    promocode: {type: String, require: true},
    promoType: {type: String, require: true},
    bank: [{ type: String}],
    bins: [{ type: Number}],
    pincode: {type: String, require: true},
    isActive: Boolean
    
        },{
            toJSON : {
                transform (doc, ret){
                    delete ret.__v
                }
            },
            timestamps : true

})

const Offer = mongoose.model<OfferDoc>('offer', OfferSchema);

export {Offer};