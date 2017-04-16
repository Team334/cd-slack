var request = require('request');
var xml2js  = require('xml2js');
var fs      = require('fs');
var config  = require('./config');

var PERSIST_FILE = "persist.json";

var CD_SPY_URL = "https://www.chiefdelphi.com/forums/cdspy.php?do=xml";
var CD_POST_URL = "https://www.chiefdelphi.com/forums/showpost.php?p=";

var previousIDs;

function refresh() {
    request(CD_SPY_URL, function(err, resp, body) {
        if (err === null) {
            handleXMLPage(body);
        } else {
            console.log("ERROR: could not retrieve chief delphi page.");
        }
    });

    // call myself after timeout
    setTimeout(refresh, config.refresh_rate);
}

function handleXMLPage(xmlData) {
    xml2js.parseString(xmlData, function(err, result) {
        var posts = result.events.event;

        var newIDs = [];
        for (var i = 0; i < posts.length; i++) {
            var postXML = posts[i];
            // more convenient object
            var post = {
                id       : postXML.id[0],
                author   : postXML.poster[0],
                postID   : postXML.postid[0],
                threadID : postXML.threadid[0],
                preview  : postXML.preview[0],
                authorID : postXML.userid[0],
                title    : postXML.title[0]
            };
            post.url = CD_POST_URL + post.postID;

            newIDs.push(post.id);

            // if we haven't seen this before
            if (!previousIDs.includes(post.id)) {
                handleNewPost(post);
            }
        }

        savePersistedIDs(newIDs);
        previousIDs = newIDs;
    });
}

function handleNewPost(post) {
    console.log('new post');
    // check if it matches any authors
    for (var i = 0; i < config.authors.length; i++) {
        if (post.author.toLowerCase() == config.authors[i].toLowerCase()) {
            triggeredAuthor(post);
            return;
        }
    }

    var triggeredKeywords = [];
    // check if it matches any keywords
    var previewLower = post.preview.toLowerCase();
    for (var i = 0; i < config.keywords.length; i++) {
        var keyword = config.keywords[i];
        if (keyword.constructor.name === 'String') {
            if (previewLower.includes(keyword.toLowerCase())) {
                triggeredKeywords.push(keyword);
            }
        } else if (keyword.constructor.name === 'RegExp') {
            if (keyword.test(post.preview)) {
                var matches = preview.match(keyword);
                triggeredKeywords = triggeredKeywords.concat(matches);
            }
        }
    }

    // if it was triggered by any keywords
    if (triggeredKeywords.length > 0) {
        triggeredKeyword(post, triggeredKeywords);
    }
}

// post triggered by a particular author
function triggeredAuthor(post) {
    var message = config.format_author
                        .replace('$author', post.author)
                        .replace('$url', post.url)
                        .replace('$post', post.preview);
    sendMessage(message);
}

// post triggered by a particular keywords(s)
function triggeredKeyword(post, keywords) {
    var message = config.format_keyword
                        .replace('$keyword', keywords.join(', '))
                        .replace('$author', post.author)
                        .replace('$url', post.url)
                        .replace('$post', post.preview);
    sendMessage(message);
}

function sendMessage(msg) {
    var payload = {
        "text": msg,
        "username": config.bot_username,
        "icon_emoji": config.bot_icon_emoji,
        "channel": config.channel
    };
    var options = {
        url: config.slack_webhook_url,
        json: true,
        body: payload
    };
    request.post(options, function(err, httpResp, body) {
        console.log("sent with error:", err);
    });
}

function getPersistedIDs() {
    var ids;
    if (fs.existsSync(PERSIST_FILE)) {
        ids = JSON.parse(fs.readFileSync(PERSIST_FILE, 'utf8'));
    } else {
        ids = [];
        savePersistedIDs(ids);
    }
    return ids;
}

// save array of persisted ids to PERSIST_FILE
function savePersistedIDs(ids) {
    var json = JSON.stringify(ids);
    fs.writeFileSync(PERSIST_FILE, json);
}

// run everything
previousIDs = getPersistedIDs();
console.log("Loaded persisted IDs");

console.log("Started refresh every", config.refresh_rate/1000, "seconds");
refresh();
