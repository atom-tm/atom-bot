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

    github()
    {
        console.log(arguments);
    }

    glo()
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

        const text = msg.cleanContent.trim();
        const [_, title, __, body] = text.match(/^TODO:\s*([^-]+)($|\s+\-\s*(.*))/i) || [];
        const column_id = this.bot.column;
        if (title) {
            this.bot.cards.create({ title, body, column_id }, (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    msg.reply(`Создана задача: ${data.html_url}`);
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