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

    // How the messages should be formatted. These special symbols will be substituted:
    // $keyword - the keyword(s) that triggered the bot
    // $author  - the author that created the post
    // $post    - the text content and link of the post
    // $url     - the url of the post
    // $thread  - the thread title
    // $t_url   - the thread url
    "format_keyword": "New mention of *$keyword* by $author: <$url|$post>",
    "format_author": "New post by *$author*: <$url|$post>"
}
