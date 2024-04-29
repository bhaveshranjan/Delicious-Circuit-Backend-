export interface CreateVendorInput{
    name: string;
    ownerName : string;
    foodType : [string];
    pincode : string;
    address : string;
    phone : string;
    email : string;
    password : string;
}

export interface EditvendorInput{
    name: string;
    address: string;
    phone: string;
    foodTypes: string;
}
export interface VendorLoginInputs{
    email: string;
    password: string;
}

export interface VendorPayload{
    _id: string;
    email: string;
    name: string;
    foodTypes: string;
}

export interface CreateOfferInputs{
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