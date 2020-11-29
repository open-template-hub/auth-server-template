import nodemailer from 'nodemailer';
import { EmailTemplatePath } from '../constant';
import { Builder } from './builder.util';

const builder = new Builder();

export class MailUtil {
  private readonly config: any;

  constructor() {
    this.config = {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    };
  }

  sendAccountVerificationMail = async (user, token) => {
    let transporter = nodemailer.createTransport(this.config);

    let url = process.env.CLIENT_VERIFICATION_SUCCESS_URL + '?token=' + token;
    const clientUrl = '' + process.env.CLIENT_URL;
    url = url.replace('${CLIENT_URL}', clientUrl);

    let params = new Map<string, string>();
    params.set('${url}', url);
    params.set('${username}', user.username);

    let mailBody = builder.buildTemplateFromFile(EmailTemplatePath, params);

    console.log('Sending verification email to user: ', user.username);

    await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: 'Account verification',
      html: mailBody,
    });
  };

  sendPasswordResetMail = async (user, token) => {
    let transporter = nodemailer.createTransport(this.config);

    let url =
      process.env.CLIENT_RESET_PASSWORD_URL +
      '?token=' +
      token +
      '&username=' +
      user.username;
    const clientUrl = '' + process.env.CLIENT_URL;
    url = url.replace('${CLIENT_URL}', clientUrl);

    await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: 'Forget password',
      html: `<a href='${url}'>Reset password link</a>`,
    });
  };
}
