import {
  AuthActionType,
  ContextArgs,
  MessageQueueChannelType,
  QueueConsumer,
  QueueMessage,
} from '@open-template-hub/common';

export class AuthQueueConsumer implements QueueConsumer {
  private channel: any;
  private ctxArgs: ContextArgs = {} as ContextArgs;

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

  private operate = async (
    msg: any,
    msgObj: any,
    requeue: boolean,
    hook: Function
  ) => {
    try {
      console.log(
        'Message Received with deliveryTag: ' + msg.fields.deliveryTag,
        msgObj
      );
      await hook();
      await this.channel.ack(msg);
      console.log(
        'Message Processed with deliveryTag: ' + msg.fields.deliveryTag,
        msgObj
      );
    } catch (e) {
      console.log(
        'Error with processing deliveryTag: ' + msg.fields.deliveryTag,
        msgObj,
        e
      );

      await this.moveToDLQ(msg, requeue);
    }
  };

  private moveToDLQ = async (msg: any, requeue: boolean) => {
    try {
      const orchestrationChannelTag =
        this.ctxArgs.envArgs.mqArgs?.orchestrationServerMessageQueueChannel;

      const message = {
        sender: MessageQueueChannelType.AUTH,
        receiver: MessageQueueChannelType.DLQ,
        message: {
          owner: MessageQueueChannelType.AUTH,
          msg,
        },
      } as QueueMessage;

      await this.ctxArgs.message_queue_provider?.publish(
        message,
        orchestrationChannelTag as string
      );

      this.channel.reject(msg, false);
    } catch (e) {
      console.log('Error while moving message to DLQ: ', msg);
      this.channel.nack(msg, false, requeue);
    }
  };
}
