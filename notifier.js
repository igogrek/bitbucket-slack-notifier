const express = require('express')
const bodyParser = require('body-parser');
const request = require('request');
// Constants
const urlPath = 'notify';
const port = 9999;
const webHookUrl = 'https://hooks.slack.com/services/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';

const app = express();
// Don't forget to set Content-Type: application/json
app.use(bodyParser.json());

app.post('/' + urlPath, function (req, res) {
    if (req.body) {
        const reviewers = req.body.pullRequestReviewers.split(',');
        reviewers.forEach(function (reviewer) {
            console.log(reviewer);

            let cause = 'created a new';
            if (req.body.buttonTrigger)
                cause = 'kindly asks you to review his'
            let message = `*${req.body.pullRequestAuthorDisplayName}* ${cause} Pull Request: _${req.body.pullRequestTitle}_ \nPlease review at:`;
            request.post({
                url: webHookUrl,
                json: {
                    channel: '@iminin',
                    text: message,
                    "attachments": [
                        {
                            "color": "#3AA3E3",
                            "text": `${req.body.pullRequestUrl}`,
                        },
                        {
                            "color": "#F35A00",
                            "text": "Will you do it right now?",
                            "actions": [
                                {
                                    "name": "yes",
                                    "text": "Yes master!",
                                    "style": "danger",
                                    "type": "button",
                                    "value": "yes"
                                }
                            ],
                            //"footer": "Yes I'm a bot (c) :robot_face:"                         
                        }
                    ]
                }
            }, function (error, response, body) {
                console.log(body);
            });
        });
    }
    res.send(req.body);
});

app.listen(9999);
console.log('Notifier server started at port ' + port);