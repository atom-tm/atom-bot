require('dotenv').config();

module.exports = {
    webhookSecret: process.env.WEBHOOK_SECRET,
    gloToken: process.env.GLO_TOKEN,
    discordToken: process.env.DISCORD_TOKEN,
    githubToken: process.env.GITHUB_ACCESS_TOKEN,
    githubRepo: process.env.GITHUB_REPO,
    githubOwner: process.env.GITHUB_OWNER,
    githubColumnId: process.env.GITHUB_COLUMN_ID,
    prefix: process.env.COMMAND_PREFIX,
}