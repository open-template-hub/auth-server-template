import { 
    PostgreSqlProvider, 
    TwoFactorCodeRequestParams, 
    MessageQueueProvider, 
    MessageQueueChannelType,
    SmsActionType,
    QueueMessage,
    HttpError,
    ResponseCode
} from "@open-template-hub/common";
import { Environment } from "../../environment";
import { TwoFactorCode } from "../interface/two-factor-code.interface";
import { TwoFactorCodeRepository } from "../repository/two-factor.repository";
import crypto from 'crypto';

export class TwoFactorCodeController {
    constructor(
        private environment = new Environment()
    ) {
        // intentionally blank
    }

    request = async( 
        db: PostgreSqlProvider, 
        messageQueueProvider: MessageQueueProvider, 
        twoFactorCode: TwoFactorCode,
    ) => {
        let twoFactorCodeExpire = +(this.environment.args().twoFactorCodeArgs.twoFactorCodeExpire);
        let twoFactorCodeLength = +(this.environment.args().twoFactorCodeArgs.twoFactorCodeLength);
        let twoFactorCodeType = (this.environment.args().twoFactorCodeArgs.twoFactorCodeType)

        let expiry = new Date()
        expiry.setSeconds( expiry.getSeconds() + twoFactorCodeExpire )

        twoFactorCode.expiry = expiry.getTime().toString() 
        twoFactorCode.code = this.randomStringGenerate( twoFactorCodeLength, twoFactorCodeType )

        const twoFactorRepository = new TwoFactorCodeRepository( db );

        await twoFactorRepository.insertTwoFactorCode( 
            twoFactorCode.username, 
            twoFactorCode.phoneNumber, 
            twoFactorCode.code, 
            twoFactorCode.expiry
        );

        await this.sendTwoFactorRequestToQueue(
            messageQueueProvider,
            twoFactorCode
        );
    }

    private randomString( length: number, chars: string ): string {
      const charsLength = chars.length;
      if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
          + ', otherwise unpredictability will be broken');
      }

      const randomBytes = crypto.randomBytes(length);
      let result = new Array(length);

      let cursor = 0;
      for (let i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
      }

      return result.join('');
    }

    private randomStringGenerate( length: number, codeType: string ): string {
      let chars: string;

      if( codeType === 'numeric' ) {
        chars = '0123456789'
      }
      else {
        chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      }

      return this.randomString( length, chars ) ;
    }

    private async sendTwoFactorRequestToQueue( 
        messageQueueProvider: MessageQueueProvider, 
        twoFactorCode: TwoFactorCode
    ) {
        const orchestrationChannelTag =
        this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

        const twoFactorRequestParams = {
            username: twoFactorCode.username,
            phoneNumber: twoFactorCode.phoneNumber,
            twoFactorCode: twoFactorCode.code
        } as TwoFactorCodeRequestParams;

      const message = {
        sender: MessageQueueChannelType.AUTH,
        receiver: MessageQueueChannelType.SMS,
        message: {
          smsType: {
            twoFactorCodeRequest: {
              params: twoFactorRequestParams,
            }
          },
          language: twoFactorCode.languageCode
        } as SmsActionType,
      } as QueueMessage;
      
      await messageQueueProvider.publish(
        message,
        orchestrationChannelTag as string
      );
    }

    verify = async(
      db: PostgreSqlProvider,
      username: string,
      twoFactorCode: string
    ) => {
      const twoFactorCodeRepository = new TwoFactorCodeRepository( db );

      const twoFactorCodeResponse = await twoFactorCodeRepository.findTwoFactorCodeByUsername(
        username
      );

      // expiry check
      if( twoFactorCodeResponse.expiry < new Date().getTime().toString() ) {
        console.log( "Expiry ", twoFactorCodeResponse.expiry );
        console.log( "now ", new Date().getTime().toString() )
        let e = new Error('Code Expired') as HttpError;
        e.responseCode = ResponseCode.BAD_REQUEST;
        console.error(e);
        throw e;
      }

      // Code Check
      if( twoFactorCodeResponse.code !== twoFactorCode ) {
        let e = new Error('Invalid Code') as HttpError;
        e.responseCode = ResponseCode.BAD_REQUEST;
        console.error(e);
        throw e; 
      }
    }
}