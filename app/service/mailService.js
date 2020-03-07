const nodemailer = require("nodemailer");

const service = {
    sendAccountVerificationMail: async function (host, email, token) {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });

        const url = host + "/auth/verify?token=" + token;

        await transporter.sendMail({
            from: 'auth-server',
            to: email,
            subject: "Account verification",
            html: `<a href='${url}'>Account verification link</a>`
        });
    }
};

module.exports = service;