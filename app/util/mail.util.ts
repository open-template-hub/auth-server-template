import nodemailer from 'nodemailer';
import { EmailTemplatePath } from '../constant';
import { Builder } from './builder.util';
import {debugLog} from "./debug-log.util";

const builder = new Builder();

const templates = {
  verifyAccount: './assets/mail-templates/verify-account.html',
  forgetPassword: './assets/mail-templates/forget-password.html'
};

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
    let url = process.env.CLIENT_VERIFICATION_SUCCESS_URL + '?token=' + token;

    await this.send(url, user, 'Account verification', templates.verifyAccount);
  };

  sendPasswordResetMail = async (user, token) => {
    let url = process.env.CLIENT_RESET_PASSWORD_URL + '?token=' + token + '&username=' + user.username;
    await this.send(url, user, 'Forget password', templates.forgetPassword);
  };

  send = async (url, user, subject, template) => {
    if (process.env.MAIL_SERVER_DISABLED) {
      debugLog('Mail server is disabled. Some functionalities may not work properly.');
      return;
    }

    let transporter = nodemailer.createTransport(this.config);

    const clientUrl = '' + process.env.CLIENT_URL;
    url = url.replace('${CLIENT_URL}', clientUrl);

    let params = new Map<string, string>();
    params.set('${url}', url);
    params.set('${username}', user.username);

    let mailBody = builder.buildTemplateFromFile(template, params);

    await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: subject,
      html: mailBody
    });
  };
}
