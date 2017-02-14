'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
// Variables
const variables = require('./variables');
const slackUrl = 'https://slack.com/api/chat.postMessage';

const app = express();
app.use(bodyParser.json());

function sendMessage(channel, message, pullRequestUrl, color) {
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
                    text: pullRequestUrl,
                    // footer: 'Yes I'm a bot (c) :robot_face:'
                }
            ])
        }
    }, function (error, response, body) {
        console.log(body);
    });
}

app.post('/' + variables.urlPath, function (req, res) {
    console.log(req.body);
    if (req.body) {
        if (req.body.conflict) {
            // Notify on PR conflicts
            const conflictMessage = `:crossed_swords:  *Warning*! Your Pull Request _${req.body.pullRequestTitle}_ has conflicts with branch *${req.body.toBranch}* \nSee conflicts at:`;
            sendMessage(req.body.pullRequestAuthor, conflictMessage, req.body.pullRequestUrl, '#D21111');
        } else if (req.body.pullRequestAction == 'OPENED' || req.body.pullRequestAction == 'BUTTON_TRIGGER') {
            // Notify on opened PR or button click
            const reviewers = req.body.pullRequestReviewers.split(',');
            reviewers.forEach(function (reviewer) {
                let cause = `:inbox_tray: *${req.body.pullRequestAuthorDisplayName}* created a new`;
                // Change text if button clicked
                if (req.body.pullRequestAction == 'BUTTON_TRIGGER')
                    cause = `:bell: *${req.body.pullRequestAuthorDisplayName}* *reminds* you to review his`;
                const message = `${cause} Pull Request: _${req.body.pullRequestTitle}_ \nPlease review at:`;
                sendMessage(reviewer, message, req.body.pullRequestUrl, '#3AA3E3');
            });
        } else if (req.body.pullRequestAction == 'APPROVED') {
            // Notify if required approvals are reached
            if (req.body.pullRequestApprovedCount >= variables.requiredApprovals) {
                const successMessage = `:tada: *Hurray*!!! Your Pull Request _${req.body.pullRequestTitle}_ reached required approval count and ready to be merged! \nCome on click *Merge* at:`;
                sendMessage(req.body.pullRequestAuthor, successMessage, req.body.pullRequestUrl, '#3DB014');
            }
        } else if (req.body.pullRequestAction == 'COMMENTED') {
            // Notify on new comment if it's not own comment
            if (req.body.triggerUser == variables.ciUserName && req.body.buildFailed) {
                // Notify if ci commented that build failed
                const buildFailedMessage = `:x: *Warning*! Your Pull Request _${req.body.pullRequestTitle}_ just failed to build on ${variables.ciUserName} \nSee at:`;
                sendMessage(req.body.pullRequestAuthor, buildFailedMessage, req.body.pullRequestUrl, '#D21111');
            } else if (req.body.triggerUser != req.body.pullRequestAuthor && req.body.triggerUser != variables.ciUserName) {
                const commentMessage = `:speech_balloon: *${req.body.triggerDisplayName}* commented on your Pull Request _${req.body.pullRequestTitle}_:\n ${req.body.comment} \nReply at:`;
                sendMessage(req.body.pullRequestAuthor, commentMessage, req.body.pullRequestUrl, '#EFC058');
            }
        }
    }
    res.send(req.body);
});

app.listen(variables.port);
console.log('Notifier server started at port ' + variables.port);