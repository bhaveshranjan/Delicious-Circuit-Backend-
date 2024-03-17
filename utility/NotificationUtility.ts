//Email

//notification

//OTP
export const GenerateOtp =()=>{

    const otp = Math.floor(100000 + Math.random() * 900000)
    let expiry = new Date()
    expiry.setTime( new Date().getTime() + (30 * 60 * 1000))

    return { otp, expiry}
}

export const onRequestOTP = async(otp: number, toPhoneNumber: string)=> {

    const accountSid = "AC0d404ee1e82650935f6ba092b4cab508";
    const authToken = "836c2fc753b5a9495ec43d85d834cec9";
    const client = require('twilio')(accountSid, authToken);

    const response = await client.messages.create({
        body: `Your OTP for Delicious Circuit to create account is ${otp}`,
        from: '+16593007585',
        to: `+91${toPhoneNumber}`,
    })

    return response;

}
// Payment notification or emails