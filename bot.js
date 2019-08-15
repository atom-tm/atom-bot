const EventEmitter = require('events')
const discord = require('discord.js')
const { github } = require('github-projects')

const configureDiscord = Symbol('configureDiscord')
const configureGithub = Symbol('configureGithub')
const handleCommand = Symbol('handleCommand')
const discordBot = Symbol('discordBot')

class Bot extends EventEmitter
{
    constructor(params)
    {
        super();
        params = params || { };
        if (typeof params.discordToken == 'string') {
            this[configureDiscord](params);
        }
        if (typeof params.githubToken == 'string') {
            this[configureGithub](params);
        }

        this.prefix = params.prefix || 'a!';
        return new Proxy(this, this);
    }

    get(self, prop)
    {
        return this[prop] || this[discordBot][prop];
    }

    start()
    {
        if (this[discordBot] && typeof this.discordToken == 'string') {
            this[discordBot].on('ready', () => console.log('[Discord] Bot started'));
            this[discordBot].login(this.discordToken);
        }
    }

    [handleCommand](message)
    {
        const [ _, command, __, data ] = message.cleanContent.match(`^\\s*${this.prefix}(\\S+)(\\s*$|\\s+(.+))`) || [];
        if (command) {
            this.emit(`command:${command}`, data, message);
            message.reply(`Получена команда '${command}' с аргументом ${data}`); //debug
        } else {
            this.emit('message', message);
        }
    }

    [configureDiscord](params)
    {
        this.discordToken = params.discordToken;
        this[discordBot] = new discord.Client();
        this[discordBot].on('message', message => this[handleCommand](message));
        this[discordBot].on('error', err => this.emit('error', err));
    }

    [configureGithub](params)
    {
        this.githubToken = params.githubToken;
        this.issues = new github.Issues(params.githubOwner, params.githubRepo);
    }
}

module.exports = Bot