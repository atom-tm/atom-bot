const config = require('./config')
const Bot = require('./bot');
const BotController = require('./controller')

const bot = new Bot(config);
const controller = new BotController(bot);
bot.start();
