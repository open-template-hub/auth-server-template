const nodemailer = require("nodemailer");

const mailConf = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
};

const service = {
    sendAccountVerificationMail: async (email, token) => {
        let transporter = nodemailer.createTransport(mailConf);

        let url = process.env.CLIENT_VERIFICATION_SUCCESS_URL + '?token=' + token;
        url = url.replace('${CLIENT_URL}', process.env.CLIENT_URL);

        await transporter.sendMail({
            from: 'auth-server',
            to: email,
            subject: "Account verification",
            html: `<a href='${url}'>Account verification link</a>`
        });
    },

    sendPasswordResetMail: async (user, token) => {
        let transporter = nodemailer.createTransport(mailConf);

        let url = process.env.CLIENT_FORGET_PASSWORD_URL + '?token=' + token + '&username=' + user.username;
        url = url.replace('${CLIENT_URL}', process.env.CLIENT_URL);

        await transporter.sendMail({
            from: 'auth-server',
            to: user.email,
            subject: "Forget password",
            html: `<a href='${url}'>Reset password link</a>`
        });
    }
};

module.exports = service;