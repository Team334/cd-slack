var request = require('request');
var xml2js  = require('xml2js');
var fs      = require('fs');
var config  = require('./config');

var PERSIST_FILE = "persist.json";

var CD_SPY_URL = "https://www.chiefdelphi.com/forums/cdspy.php?do=xml";
const CD_POST_URL = "https://www.chiefdelphi.com/forums/showthread.php?p=";
const CD_THREAD_URL = "https://www.chiefdelphi.com/forums/showthread.php?threadid=";

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
            // post url
            post.url = CD_POST_URL + post.postID + "#post" + post.postID;
            // thread url
            post.t_url = CD_THREAD_URL + post.threadID;
            // preview text but quoted
            post.preview_quoted = "> " + post.preview.replace(/\n/g, "\n> ");

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
    var previewText      = post.preview;
    var previewTextLower = post.preview.toLowerCase();
    config.triggers.forEach(function(trigger) {
        // haha very funny i know
        var triggered = false;

        if (trigger.authors) {
            for (var i = 0; i < trigger.authors.length; i++) {
                var author = trigger.authors[i];
                if (post.author.toLowerCase() == author.toLowerCase()) {
                    triggeredByAuthor(post, trigger);
                    triggered = true;
                    break;
                }
            }
        }
        if (triggered)
            return;

        var keywordHits = [];
        if (trigger.keywords) {
            trigger.keywords.forEach(function(k) {
                if (k.constructor.name === 'String') {
                    var regexStr = "\\b" + k + "\\b";
                    var regex = new RegExp(regexStr, 'gi');
                    if (regex.test(previewText)) {
                        keywordHits.push(k);
                        triggered = true;
                    }
                } else if (k.constructor.name === 'RegExp') {
                    if (k.test(previewTest)) {
                        keywordHits = keywordHits.concat(previewText.match(k));
                        triggered = true;
                    }
                }
            });
        }

        if (triggered)
            triggeredByKeywords(post, trigger, keywordHits);
    });
}

// post triggered by a particular author
function triggeredByAuthor(post, trigger) {
    var message = config.format_author
                        .replace('$author', post.author)
                        .replace('$url', post.url)
                        .replace('$post_quoted', post.preview_quoted)
                        .replace('$post', post.preview)
                        .replace('$thread', post.title)
                        .replace('$t_url', post.t_url);
    if (trigger.mention)
        message = message.replace('$mention', trigger.mention);

    sendMessage(message, trigger);
}

// post triggered by a particular keywords(s)
function triggeredByKeywords(post, trigger, keywords) {
    var message = config.format_keyword
                        .replace('$keyword', keywords.join(', '))
                        .replace('$author', post.author)
                        .replace('$url', post.url)
                        .replace('$post_quoted', post.preview_quoted)
                        .replace('$post', post.preview)
                        .replace('$thread', post.title)
                        .replace('$t_url', post.t_url);
    if (trigger.mention)
        message = message.replace('$mention', trigger.mention);

    sendMessage(message, trigger);
}

function sendMessage(msg, trigger) {
    var channel = trigger.channel || config.default_channel;
    var payload = {
        "text": msg,
        "username": config.bot_username,
        "icon_emoji": config.bot_icon_emoji,
        "channel": channel
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
