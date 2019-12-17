const Storage = require('./base')

class MemoryStorage extends Storage
{
    constructor(params)
    {
        super();
    }
}

module.exports = MemoryStorage