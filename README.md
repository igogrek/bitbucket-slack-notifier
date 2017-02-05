# bitbucket-slack-notifier

This is simple BitBucket Server -> Slack Notifier service.

The initial goal is to notify reviewers on any changes configured.

Intended to use with https://github.com/tomasbjerre/pull-request-notifier-for-bitbucket

This is only the interceptor of outgoing requests from Pull Request Notifier plugin.

The idea is to not just post in a channel for all PR's changes etc but to send a private messages to the
required people

#Features
- Send **private Slack messages** to all reviewers of the Pull Request
- Send notification from button click to ping those who forgot to review
- Notify pull request author when it's approval count is reached and ready to be merged
- Send comment to the PR author directly from review
- Notify on build error of the PR

##Usage

1. Install Slack and open management web app
2. Add custom integration - **bot** and configure all fields. Copy bot token 
1. Install BitBucket and get Pull Request Notifier plugin via Atlassian Marketplace
2. Enable all needed triggers in plugin
2. Configure plugin to send messages to *localhost:9999/notify*
3. Set request to POST with payload from this repo *config.json* and Content-Type: application/json
3. Add basic button [] to toggle messages on click
4. Clone this project
5. Install node.js with NPM
6. Run `npm install` to get dependencies
6. Rename example-variables.json into variables.json and configure required fields - most importantly add bot token from slack
8. Run `node notifier` to start the service (i would suggest using pm2 to demonize the service on the server)
9. Fork for any required changes in the message

##How it works

This is just an example service that turns PR Notifier plugin messages into slack messages.
It recieves message from plugin on defined trigger and sends them yo your slack bot.

##TODO
  - Cleanup and bugfix
  - Improve docs
  - Tests
