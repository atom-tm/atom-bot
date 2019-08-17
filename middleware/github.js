const Webhook = require('./webhook')

class GithubWebhook extends Webhook
{
    constructor(options)
    {
        options = options || { };
        options.eventHeader = options.eventHeader || 'x-github-event';
        options.signatureHeader = options.signatureHeader || 'x-hub-signature';
        super(options);
    }
}

module.exports = GithubWebhook;