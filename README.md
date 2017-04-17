# **cd-slack**: Chief Delphi Slack Bot

A slack bot that notifies your team about Chief Delphi posts. The bot can be triggered
by certain keywords or posts by a particular author.

<img width="50%" src="https://raw.githubusercontent.com/Team334/cd-slack/master/screenshots/image1.png">

## Configuration

Use `config.js` to configure your bot. You can copy the sample config
`config.example.js` to `config.js` to get started.

Sample config:

```js
var config = {
    "slack_webhook_url": "<your incoming webhook url>",
    "bot_username": "Chief Delphi Bot", // whatever you want
    "bot_icon_emoji": ":first:",        // the emoji to use as avatar
    "channel": "#programming",          // the channel to post in

    // how long to wait between updates in milliseconds
    "refresh_rate": 15*1000, // 15 seconds

    // Which keywords trigger the bot. Can use regex.
    "keywords": [
        "334", "bamboozled", "opencv",
        /gracious (professionalism|memes)/gi
    ],

    // Which authors trigger the bot (for interesting people)
    "authors": ["augustt198"]

    // How the messages should be formatted. These special symbols will be substituted:
    // $keyword - the keyword(s) that triggered the bot
    // $author  - the author that created the post
    // $post    - the text content and link of the post
    // $url     - the url of the post
    "format_keyword": "New mention of *$keyword* by $author: <$url|$post>",
    "format_author": "New post by *$author*: <$url|$post>"
}

module.exports = config;
```

## Running

`$ node bot.js`

### To-Do

- [ ] Trigger bot when a member of a particular team posts.
- [ ] Get the entire post, not just preview
- [ ] Ability to subscribe to threads
