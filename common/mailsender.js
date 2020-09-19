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

        await transporter.sendMail({
            to: receiver, // list of receivers
            subject: "Activation Link", // Subject line
            text: `Your Activation link is : https://bharani-url-shortener.netlify.app/verify.html?${key}?=${activationKey}`,
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    sendMail
}