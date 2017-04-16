# **cd-slack**: Chief Delphi Slack Bot

A slack bot that notifies your team when a new post on Chief Delphi contains a keyword.

## Usage

Use `config.js` to configure your bot. Here's a sample configuration:

```js
{
    "webhook_url": "<get this url from slack>",
    "bot_username": "Chief Delphi Bot",
    "bot_icon_emoji": ":robot:",
    "channel": "<the channel to post in>",
    // how long to wait between updates in milliseconds
    "refresh_rate": 30*1000 // 30 seconds

    // Which keywords trigger the bot. Can use regex.
    "keywords": [
        "334", "bamboozled", "opencv",
        /gracious (professionalism|memes)/gi
    ],

    // Which authors trigger the bot (for interesting people)
    "authors": ["augustt198"],

    // How the messages should be formatted. These special symbols will be substituted:
    // $keyword - the keyword(s) that triggered the bot
    // $author - the author that created the post
    // $post - the text content and link of the post
    "format_keyword": "New mention of $keyword by $author: $post",
    "format_author": "New post by $author: $post"
}
```

### To-Do

- Trigger bot when a member of a particular team posts.
