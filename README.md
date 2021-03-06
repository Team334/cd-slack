# **cd-slack**: Chief Delphi Slack Bot

A slack bot that notifies your team about Chief Delphi posts. The bot can be triggered
by certain keywords or posts by a particular author.

<img width="90%" src="https://raw.githubusercontent.com/Team334/cd-slack/master/screenshots/image2.png">

## Configuration

Use `config.js` to configure your bot. You can copy the sample config
`config.example.js` to `config.js` to get started.

Sample config:

```js
module.exports = {
    "slack_webhook_url": "<your incoming webhook url>",
    "bot_username": "Chief Delphi Bot", // whatever you want
    "bot_icon_emoji": ":first:",        // the emoji to use as avatar
    "default_channel": "#programming",  // the channel to post in (by default)

    // how long to wait between updates in milliseconds
    "refresh_rate": 15*1000, // 15 seconds

    // what keywords/authors trigger the bot, where to post notification,
    // and who to notify
    "triggers": [
        {
            "keywords": ["New York City", "NYC", "brooklyn"],
            "channel": "#general"
        },
        {
            "keywords": ["computer vision", "opencv", "neural networks"],
            "authors": ["Tom Bottiglieri", "Jared Russell"],
            "channel": "#programming",
            "mention": "@august @eric"
        },
        {
            "keywords": ["bamboozled", /gracious (professionalism|memes)/gi],
            "channel": "#memes"
        }
    ],

    // How the messages should be formatted.
    "format_keyword": "New mention of *$keyword* by $author: <$url|$post>",
    "format_author": "New post by *$author*: <$url|$post>"
}
```

## Running

`$ node bot.js`

### To-Do

- [ ] Trigger bot when a member of a particular team posts.
- [ ] Get the entire post, not just preview
- [ ] Ability to subscribe to threads
- [x] More granular posting - target keywords towards certain channels & users.
