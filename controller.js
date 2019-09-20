const Bot = require('./bot')
const Commands = require('./commands')

class BotController
{
    constructor(bot)
    {
        if (!bot instanceof Bot) {
            throw new Error('BotController must be constructed with Bot instance');
        }

        for (let event of getAllMethods(this)) {
            bot.on(event, this[event].bind(this));
        }

        this.bot = bot;
    }

    github(event, data)
    {
        console.log(arguments);
    }

    glo(event, data)
    {
        console.log(arguments);
    }

    command(name, msg, arg)
    {
        if (typeof Commands[name] === 'function') {
            Commands[name](this.bot, msg, arg);
        }
    }

    message(msg)
    {
        if (msg.author.id === this.bot.user.id) return;
        if (!this.bot.cards) return;

        const column_id = this.bot.column;
        const text = msg.cleanContent.trim();
        let [_, title, __, body] = text.match(/^TODO:\s*([^-]+)($|\s+\-\s*([^]*))/i) || [];
        if (title) {
            if (body === undefined) {
                body = `Source: ${msg.url}`;
            } else {
                body = `${body}\n${'_'.repeat(40)}\nSource: ${msg.url}`;
            }
            this.bot.cards.create({ title, body, column_id }, (err, response) => {
                if (err) {
                    console.error(err);
                } else {
                    const link = response.data.content_url.replace('api.github.com/repos', 'github.com');
                    msg.reply(`Создана задача: ${link}`);
                }
            });
        } else if (text.startsWith('TODO')) {
            msg.reply('Чтобы создать задачу, напишите `TODO: <Title> - <Text>`');
        }
    }
}


function getAllMethods(obj)
{
    let props = [];
    do {
        const l = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
            .sort()
            .filter((p, i, arr) =>
                typeof obj[p] === 'function' &&  //only the methods
                p !== 'constructor' &&           //not the constructor
                (i == 0 || p !== arr[i - 1]) &&  //not overriding in this prototype
                props.indexOf(p) === -1          //not overridden in a child
            );
        props = props.concat(l);
    } while (
        (obj = Object.getPrototypeOf(obj)) &&   //walk-up the prototype chain
        Object.getPrototypeOf(obj)              //not the the Object prototype methods (hasOwnProperty, etc...)
    );
    return props;
}

module.exports = BotController