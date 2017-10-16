const fs = require('fs');
const request = require('request');
const variables = require('./variables');
const slackUrl = 'https://slack.com/api/chat.postMessage';

const green = '#00B300';
const red = '#D21111';
const blue = '#3AA3E3';
const yellow = '#EFC058';

function getUserChannel(user) {
    let channel = '';
    const users = JSON.parse(fs.readFileSync('users.json'));
    console.log(users);
    Object.keys(users).forEach(function (userId) {
        if (userId == user) {
            channel = users[userId];
        }
    });
    return channel;
}

function sendSlackMessage(channel, message, linkUrl, color, expressResponse) {
    request.post({
        proxy: variables.proxy,
        url: slackUrl,
        form: {
            token: variables.botToken,
            channel: '@' + channel,
            text: message,
            as_user: true,
            attachments: JSON.stringify([
                {
                    color: color,
                    text: linkUrl,
                    // footer: 'Yes I'm a bot (c) :robot_face:'
                }
            ])
        }
    }, function (error, response, body) {
        const slackError = JSON.parse(body).error;
        if (slackError) {
            expressResponse.status(500).send(slackError);
        } else {
            expressResponse.send(body);
        }
    });
}

function sendMessage(user, message, pullRequestUrl, color, expressResponse) {
    const channel = getUserChannel(user);
    if (channel) {
        sendSlackMessage(channel, message, pullRequestUrl, color, expressResponse);
    } else {
        const message = `User "${user}" is not mapped to a slack channel in users.json`;
        console.log(message);
        expressResponse.status(500).send(message);
    }
}

module.exports = function (app) {

    app.post('/' + variables.urlPath, function (req, res) {
        if (req.body) {
            if (req.body.conflict) {
                // Notify on PR conflicts
                const conflictMessage = `:crossed_swords:  *Warning*! Your Pull Request _${req.body.pullRequestTitle}_ has conflicts with branch *${req.body.toBranch}* \nSee conflicts at:`;
                sendMessage(req.body.pullRequestAuthor, conflictMessage, req.body.pullRequestUrl, red, res);
            } else if (req.body.pullRequestAction == 'OPENED' || req.body.pullRequestAction == 'BUTTON_TRIGGER') {
                // Notify on opened PR or button click
                const reviewers = req.body.pullRequestReviewers.split(',');
                reviewers.forEach(function (reviewer) {
                    let cause = `:inbox_tray: *${req.body.pullRequestAuthorDisplayName}* created a new`;
                    // Change text if button clicked
                    if (req.body.pullRequestAction == 'BUTTON_TRIGGER')
                        cause = `:bell: *${req.body.pullRequestAuthorDisplayName}* *reminds* you to review his`;
                    const message = `${cause} Pull Request: _${req.body.pullRequestTitle}_ \nPlease review at:`;
                    sendMessage(reviewer, message, req.body.pullRequestUrl, blue, res);
                });
            } else if (req.body.pullRequestAction == 'APPROVED') {
                // Notify if required approvals are reached
                if (req.body.pullRequestApprovedCount >= variables.requiredApprovals) {
                    const successMessage = `:tada: *Hurray*!!! Your Pull Request _${req.body.pullRequestTitle}_ reached required approval count and ready to be merged! \nCome on click *Merge* at:`;
                    sendMessage(req.body.pullRequestAuthor, successMessage, req.body.pullRequestUrl, green, res);
                }
            } else if (req.body.pullRequestAction == 'COMMENTED') {
                // Notify on new comment if it's not own comment
                if (req.body.triggerUser == variables.ciUserName && req.body.buildFailed) {
                    // Notify if ci commented that build failed
                    const buildFailedMessage = `:x: *Warning*! Your Pull Request _${req.body.pullRequestTitle}_ just failed to build on ${variables.ciUserName} \nSee at:`;
                    sendMessage(req.body.pullRequestAuthor, buildFailedMessage, req.body.pullRequestUrl, red, res);
                } else if (req.body.triggerUser == variables.ciUserName && req.body.buildSuccessful) {
                    // Build successful
                    const buildSuccessfulMessage = `:white_check_mark: *Good Job*! Your Pull Request _${req.body.pullRequestTitle}_ was successfully build on ${variables.ciUserName} \nSee at:`;
                    sendMessage(req.body.pullRequestAuthor, buildSuccessfulMessage, req.body.pullRequestUrl, green, res);
                } else if (req.body.triggerUser != req.body.pullRequestAuthor && req.body.triggerUser != variables.ciUserName) {
                    // Comment from reviewer
                    const commentMessage = `:speech_balloon: *${req.body.triggerDisplayName}* commented on your Pull Request _${req.body.pullRequestTitle}_:\n ${req.body.comment} \nReply at:`;
                    sendMessage(req.body.pullRequestAuthor, commentMessage, req.body.pullRequestUrl, yellow, res);
                }
            }
        } else {
            res.send(req.body);
        }
    });

    app.post(`/${variables.urlPath}/test`, function (req, res) {
        sendSlackMessage(req.body.channel, 'Test Slack ID message: SUCCESS', req.body.url, green, res);
    });
}
