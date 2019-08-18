const EventEmitter = require('events')
const bufferEq = require('buffer-equal-constant-time')
const crypto = require('crypto')

class Webhook extends EventEmitter
{
    constructor(options)
    {
        super();
        options = options || { };
        this.secret = options.secret || '';
        this.eventHeader = options.eventHeader || 'x-event';
        this.signatureHeader = options.signatureHeader || 'x-hub-signature';
        this.path = options.path || '/webhook';
        this.middleware = this.middleware.bind(this);
    }

    signData(data)
    {
        return 'sha1=' + crypto.createHmac('sha1', this.secret).update(data).digest('hex');
    }

    verifySignature(data, signature)
    {
        return bufferEq(Buffer.from(signature), Buffer.from(this.signData(data)));
    }

    handleSuccess(req, res, event, data)
    {
        this.emit('*', event, data);
        this.emit(event, data);
        if (data.action) {
            this.emit(`${event}:${data.action}`, data);
        }
    }

    handleError(req, res, error)
    {
        res.status(400).send({ error });
        this.emit('error', new Error(error), req, res);
    }

    middleware(req, res, next)
    {
        if (req.method !== 'POST' || req.url.split('?').shift() !== this.path) {
            return next();
        }

        const event = req.headers[this.eventHeader];
        if (!event) {
            return this.handleError(req, res, 'No event found in the request');
        }

        const sign = req.headers[this.signatureHeader];
        if (this.secret && !sign) {
            return this.handleError(req, res, 'No signature found in the request');
        }

        const data = req.body;
        if (!data) {
            return this.handleError(req, res, 'No body. Make sure body-parser is used');
        }

        if (this.secret && !this.verifySignature(JSON.stringify(data), sign)) {
            return this.handleError(req, res, 'Failed to verify signature');
        }

        this.handleSuccess(req, res, event, data);
        res.status(200).send({ success: true });
    }
}

module.exports = Webhook;