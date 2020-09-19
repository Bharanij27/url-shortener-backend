const nodemailer = require('nodemailer');

let sendMail = async (receiver, key, activationKey) => {

    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.mailUser,
                pass: process.env.mailPass, 
            },
        });

        let mail = await transporter.sendMail({
            to: receiver, // list of receivers
            subject: "Activation Link", // Subject line
            text: `Your Activation link is : https://bharani-url-shortener.netlify.app/verify.html?${key}?=${activationKey}`,
        },(err, info) => {
            if(err) return false
            return true
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    sendMail
}