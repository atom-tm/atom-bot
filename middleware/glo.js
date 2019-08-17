const Webhook = require('./webhook')

class GloWebhook extends Webhook
{
    constructor(options)
    {
        options = options || { };
        options.eventHeader = options.eventHeader || 'x-gk-event';
        options.signatureHeader = options.signatureHeader || 'x-gk-signature';
        super(options);
    }
}

module.exports = GloWebhook;