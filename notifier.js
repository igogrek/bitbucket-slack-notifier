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
                    footer: "Yes I'm a bot (c) :robot_face:"
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
        if (req.body.pullRequestAction == 'OPENED' || req.body.pullRequestAction == 'BUTTON_TRIGGER') {
            const reviewers = req.body.pullRequestReviewers.split(',');
            reviewers.forEach(function (reviewer) {
                let cause = 'created a new';
                if (req.body.buttonTrigger)
                    cause = 'kindly asks you to review his';
                let message = `*${req.body.pullRequestAuthorDisplayName}* ${cause} Pull Request: _${req.body.pullRequestTitle}_ \nPlease review at:`;
                sendMessage(reviewer, message, req.body.pullRequestUrl, "#3AA3E3");
            });
        } else if (req.body.pullRequestAction == 'APPROVED') {
            if (req.body.pullRequestApprovedCount >= variables.requiredApprovals) {
                let successMessage = `*Hurray*!!! Your Pull Request _${req.body.pullRequestTitle}_ reached required approval count and ready to be merged! \nCome on click *Merge* at:`;
                sendMessage(req.body.pullRequestAuthor, successMessage, req.body.pullRequestUrl, "#3DB014");
            }
        }
    }
    res.send(req.body);
});

app.listen(variables.port);
console.log('Notifier server started at port ' + variables.port);