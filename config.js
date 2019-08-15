require('dotenv').config();

module.exports = {
    discordToken: process.env.DISCORD_TOKEN,
    githubToken: process.env.GITHUB_ACCESS_TOKEN,
    githubRepo: process.env.GITHUB_REPO,
    githubOwner: process.env.GITHUB_OWNER,
    prefix: process.env.COMMAND_PREFIX,
}