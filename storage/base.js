const EventEmitter = require('events')

class Storage extends EventEmitter
{
    constructor()
    {
        super();
        this.test = 123;
    }
}

module.exports = Storage