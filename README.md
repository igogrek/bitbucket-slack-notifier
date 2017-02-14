# bitbucket-slack-notifier

This is simple BitBucket Server -> Slack Notifier service.

The initial goal was to notify reviewers on any changes configured.

Intended to use with https://github.com/tomasbjerre/pull-request-notifier-for-bitbucket

This is only the interceptor of outgoing requests from Pull Request Notifier plugin.

The idea is to not just post in a channel for all PR's changes etc but to **immediately** send **private messages** to the
required people

##Features
- Send **private Slack messages** to all reviewers of the Pull Request
- Send private notification from button click to ping those who forgot to review
- Notify pull request author when it's approval count is reached and ready to be merged
- Send comment to the PR author directly from review
- Send private notification on build error of the PR
- Send private notification on conflicts with target branch either on source or target branch changes

##How it works

This is just an example service that turns PR Notifier plugin messages into slack messages.
It recieves message from plugin on defined trigger and sends them yo your slack bot.

All of the messages go to private @ Slack channels and this just works in our case -
because our Slack user id's are the same as AD account names -> e.g. slug from bitbucket plugin.
If your config will not allow this kind of thing - you can add custom mapping via JS for the usernames
or some other way to properly link user in bitbucket with Slack id.

##Usage

1. Install Slack and open management web app
2. Add custom integration - **bot** and configure all fields. Copy bot token 
1. Install BitBucket and get Pull Request Notifier plugin via Atlassian Marketplace
2. Create 3 triggers in plugin
  * main trigger, build failed and conflict
    * main -> Triggers: APPROVED, COMMENTED, OPENED, BUTTON_TRIGGER, REOPENED    
    * conflict -> trigger only when merge is conflicting, Triggers: OPENED, REOPENED, RESCOPED_FROM, RESCOPED_TO, UPDATED
    * build failed -> Filter string: ${PULL_REQUEST_COMMENT_TEXT}, Filter regexp: BUILD FAILURE, Triggers: COMMENTED
  * configure each one to send messages to *localhost:9999/notify*
  * set request to POST with payload from this repo trigger-configs: *config.json*, *conflict-config.json* and *build-failed-config.json* respectively
  * set Content-Type: application/json
  * set Encode as HTML
3. Add basic button [] to toggle messages on click (main trigger)
4. Clone this project
5. Install node.js with NPM
6. Run `npm install` to get dependencies
6. Rename example-variables.json into variables.json and configure required fields - most importantly add bot token from slack
8. Run `node notifier` to start the service (i would suggest using pm2 to demonize the service on the server)
9. Fork for any required changes in the message

##TODO
  - Cleanup and bugfix
  - Improve docs
  - Tests
