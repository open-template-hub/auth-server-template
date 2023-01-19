import {
  AbstractQueueConsumer,
  AuthActionType,
  ContextArgs,
  MessageQueueChannelType,
  QueueConsumer,
} from '@open-template-hub/common';

export class AuthQueueConsumer
  extends AbstractQueueConsumer
  implements QueueConsumer
{
  constructor() {
    super();
    this.ownerChannelType = MessageQueueChannelType.AUTH;
  }

  init = (channel: string, ctxArgs: ContextArgs) => {
    this.channel = channel;
    this.ctxArgs = ctxArgs;
    return this;
  };

  onMessage = async (msg: any) => {
    if (msg !== null) {
      const msgStr = msg.content.toString();
      const msgObj = JSON.parse(msgStr);

      const message: AuthActionType = msgObj.message;

      // Decide requeue in the error handling
      let requeue = false;

      if (message.example) {
        const exampleHook = async () => {
          console.log('Auth server example');
        };

        await this.operate(msg, msgObj, requeue, exampleHook);
      } else {
        console.log('Message will be rejected: ', msgObj);
        this.channel.reject(msg, false);
      }
    }
  };
}
