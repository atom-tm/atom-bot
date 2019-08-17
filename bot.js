const EventEmitter = require('events')
const discord = require('discord.js')
const express = require('express')
const glo = require('@axosoft/glo-sdk')
const bodyParser = require('body-parser')
const { github } = require('github-projects')
const GithubWebhook = require('./middleware/github')
const GloWebhook = require('./middleware/glo')

const startWebApp = Symbol('startWebApp')
const configureDiscord = Symbol('configureDiscord')
const configureGithub = Symbol('configureGithub')
const configureGlo = Symbol('configureGlo')
const handleMessage = Symbol('handleMessage')
const applyParams = Symbol('applyParams')
const discordBot = Symbol('discordBot')
const webApp = Symbol('webApp')

class Bot extends EventEmitter
{
    constructor(params)
    {
        super();
        this[webApp] = express();
        this[webApp].use(bodyParser.json());
        this[applyParams](params);
        return new Proxy(this, this);
    }

    get(self, prop)
    {
        return this[prop] || this[discordBot][prop];
    }

    start()
    {
        if (this[discordBot] && typeof this.discordToken == 'string') {
            this[discordBot].on('ready', () => this.emit('ready'));
            this[discordBot]
                .login(this.discordToken)
                .then(() => this[startWebApp]())
                .catch(err => console.error(`[Discord] Error: ${err}`));
        } else {
            console.log('[Discord] No token provided, exit');
        }
    }

    [startWebApp]()
    {
        console.log('[Discord] Bot started');
        if (!this.githubWebhook && !this.gloWebhook) return;

        this[webApp].listen(process.env.PORT || 8090, () => {
          console.log('[Express] WebApp started')
        });
    }

    [handleMessage](message)
    {
        const [ _, command, __, arg ] = message.cleanContent.match(`^\\s*${this.prefix}(\\S+)(\\s*$|\\s+(.+))`) || [];
        if (command) {
            this.emit('command', command, message, arg);
            message.reply(`Получена команда '${command}' с аргументом ${data}`); //debug
        } else {
            this.emit('message', message);
        }
    }

    [configureDiscord](params)
    {
        this.discordToken = params.discordToken;
        this[discordBot] = new discord.Client();
        this[discordBot].on('message', message => this[handleMessage](message));
        this[discordBot].on('error', err => this.emit('error', err));
    }

    [configureGithub](params)
    {
        this.githubToken = params.githubToken;
        this.column = params.githubColumnId;
        this.cards = new github.Cards(params.githubOwner, params.githubRepo);

        if (this.secret) {
            this.githubWebhook = new GithubWebhook({ secret: this.secret, path: '/github' })
                .on('*', (...args) => this.emit('github', ...args));
            this[webApp].use(this.githubWebhook.middleware);
        }
    }

    [configureGlo](params)
    {
        this.gloToken = params.gloToken;
        this.glo = glo(params.gloToken);

        if (this.secret) {
            this.gloWebhook = new GloWebhook({ secret: this.secret, path: '/glo' })
                .on('*', (...args) => this.emit('glo', ...args));
            this[webApp].use(this.gloWebhook.middleware);
        }
    }

    [applyParams](params)
    {
        params = params || { };

        if (typeof params.webhookSecret == 'string') {
            this.secret = params.webhookSecret;
        }
        if (typeof params.discordToken == 'string') {
            this[configureDiscord](params);
        }
        if (typeof params.githubToken == 'string') {
            this[configureGithub](params);
        }
        if (typeof params.gloToken == 'string') {
            this[configureGlo](params);
        }

        this.prefix = params.prefix || 'a!';
    }
}

module.exports = Bot