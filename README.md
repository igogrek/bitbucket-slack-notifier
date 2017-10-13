# bitbucket-slack-notifier

This is simple BitBucket Server -> Slack Notifier service.

The initial goal was to notify reviewers on any changes configured.

Intended to use with https://github.com/tomasbjerre/pull-request-notifier-for-bitbucket

This is only the interceptor of outgoing requests from Pull Request Notifier plugin.

The idea is to not just post in a channel for all PR's changes but to **immediately** send **private messages** to the
required people only.

This is very helpful and really speeds up the common BitBucket workflow.

## Features
- Send **private Slack messages** to all reviewers of the Pull Request
- Send private notification from button click to ping those who forgot to review
- Notify pull request author when it's approval count is reached and ready to be merged
- Send comment to the PR author directly from review
- Send private notification on build error of the PR
- Send private notification on conflicts with target branch either on source or target branch changes

## How it works

This is just an example service that turns PR Notifier plugin messages into slack messages.
It receives message from plugin on defined trigger and sends them yo your slack bot.

### User channel mappings

All of the messages go to private @ Slack channels.
Previously this was just working out of the box with account names, because Slack had the possibility to change
channel Id via UI.
Now it's not possible and channel Id is usually first part of the email from invite.
Like `john.doe@mail.com` will create the private Slack channel `@john.doe`.
You'll need to add a mapping between BitBucket account and your slack channel to file `users.json`.
This file will be used once the notification is being sent to find channel name of the author/reviewer/commenter.

## Usage

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
7. Add user mappings between BitBucket account name and Slack channel name to `users.json` like:
_"bitBucketUserName":"slack.username"_ 
8. Run `node notifier` to start the service (i would suggest using pm2 to demonize the service on the server)
9. Fork for any required changes in the message

## TODO
  - Cleanup and bugfix
  - Improve docs
  - Tests
