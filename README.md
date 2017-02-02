# bitbucket-notifier

This is simple bitbucket server Slack Notifier service.

The initial goal is to notify reviewers on any changes configured.

Intended to use with https://github.com/tomasbjerre/pull-request-notifier-for-bitbucket

This is only the interceptor of outgoing requests from Pull Request Notifier plugin.

##Usage

1. Install Pull Request Notifier plugin for your BitBucket Server
2. Configure plugin to send messages to *localhost:9999/notify*
3. Set request to POST with payload from this repo *config.json* and Content-Type: application/json
4. Clone this project
5. Install node.js with NPM
6. Run `npm install` to get dependencies
7. Change *webHookUrl* in notifier.js to your app hook
8. Run `node notifier` to start the service
9. Fork for any required changes in the message

#TODO
  - Cleanup and bugfix
  - Improve docs
  - Tests
