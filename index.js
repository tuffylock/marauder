// whereabouts: C2BAK1CH3

require('dotenv').config()

const { App } = require ('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// app.event('app_home_opened', ({ event, say }) => {
//   say(`heyyyy <@${event.user}>!`);
//   // // Look up the user from DB
//   // let user = store.getUser(event.user);
//   //
//   // if(!user) {
//   //   user = {
//   //     user: event.user,
//   //     channel: event.channel
//   //   };
//   //   store.addUser(user);
//   //
//   //   say(`Hello world, and welcome <@${event.user}>!`);
//   // } else {
//   //   say('Hi again!');
//   // }
// });

// too big to autoexpand but other attempts didnt animate
app.message('solemnly swear', ({ message, say, context }) => {
  app.client.chat.postMessage({
    token: context.botToken,
    channel: message.channel,
    text: '',
    attachments: [
      {
        fallback: '*map reveals its secrets*',
        image_url: 'https://i.imgur.com/prQ7fV1.gif'
      }
    ]
  });
});

app.message('mischief managed', ({ message, say, context }) => {
  app.client.chat.postMessage({
    token: context.botToken,
    channel: message.channel,
    text: '',
    attachments: [
      {
        fallback: '*map scurries away*',
        image_url: 'https://media.giphy.com/media/13gaQfRMyEUXS/giphy.gif'
      }
    ]
  });
});

app.command('/whereis', async ({ ack, payload, context }) => {
  // acknowledge the command request
  ack();

  try {
    var input = payload.text;

    if ( /^@.+$/.test(input) ) {
      // username submitted

      // remove @
      var username = input.substring(1);

      var users = await app.client.users.list({
        token: context.botToken
      });
      users = users.members;

      for (i = 0; i < users.length; i++) {
        user = users[i];
        if (user.deleted || user.is_bot ) {
          continue;
        } else if ( user.name === username || user.real_name === username ) {
          submittedUser = user;
          break;
        }
      }

      if ( typeof submittedUser !== 'undefined' ) {
        // #whereabouts C2BAK1CH3
        var messages = await app.client.channels.history({
          token: context.botToken,
          channel: 'C2BAK1CH3',
          count: 100,
        });
        messages = messages.messages;

        var latestMessage = '';
        for (i = 0; i < messages.length; i++) {
          message = messages[i];
          if (message.user === submittedUser.id) {
            latestMessage = message;
            break;
          }
        }

        var timestamp = new Date(parseFloat(latestMessage.ts)*1000);

        // check if bot has access to post back inchannel
        if ( payload.channel_name !== 'directmessage' ) {
          var channel = await app.client.channels.info({
            token: context.botToken,
            channel: payload.channel_id
          });
          channel = channel.channel;
        }

        if ( typeof channel !== 'undefined' && channel.is_member === true ) {
          var channel_id = payload.channel_id;
        } else {
          // marauder's dm id: DRQD0RGVD
          var channel_id = 'DRQD0RGVD';
        }

        const result = await app.client.chat.postEphemeral({
          token: context.botToken,
          user: payload.user_id,
          // Channel to send message to
          channel: channel_id,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `_where's ${submittedUser.real_name}?_`
              }
            },
            {
              type: 'divider',
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*via #whereabouts*'
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `_at ${timestamp.toLocaleString()}_`
              }
            },
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: `"${latestMessage.text}"`
              }
            },
            {
              type: 'divider'
            }
          ],
          // Text in the notification
          text: 'looking for someone?'
        });
        console.log(result);
      } else {
        app.client.chat.postEphemeral({
          token: context.botToken,
          user: payload.user_id,
          // Channel to send message to
          channel: payload.channel_id,
          // Text in the notification
          text: `user ${input} not found`
        });
      }

    // } else if ( input === '' || /[hH]elp/.test(input) ) {
    } else {
      app.client.chat.postEphemeral({
        token: context.botToken,
        user: payload.user_id,
        // Channel to send message to
        channel: payload.channel_id,
        // Include a button in the message (or whatever blocks you want!)
        // blocks: ,
        // Text in the notification
        text: "_enter someone's @ to find them_"
      });
    }
  }
  catch (error) {
    console.error(error);
  }
});


(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
