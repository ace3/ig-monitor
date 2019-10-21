/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable no-restricted-syntax */


require('dotenv').config()
const ig = require('instagram-scraping')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const cron = require('node-cron')

const adapter = new FileSync('db.json')
const db = low(adapter)
const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TELEGRAM_BOT_TOKEN
  ? process.env.TELEGRAM_BOT_TOKEN
  : ''

const chatId = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID : ''

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: false })

// Set some defaults (required if your JSON file is empty)

async function start() {
  await db.defaults({ posts: [] }).write()
  console.log('==INITIALIZING DATABASE==')
}
async function init(username) {
  ig.scrapeUserPage(username).then(result => {
    const datas = result.medias
    for (const data of datas) {
      const { text = '' } = data
      if (text.trim().length > 0) {
        if (text.includes('46')) {
          const check = db
            .get('posts')
            .find({ media_id: data.media_id })
            .value()

          if (!check) {
            db.get('posts')
              .push(data)
              .write()

            const generatedUrl = `https://www.instagram.com/p/${data.shortcode}/`
            bot.sendMessage(chatId, `${data.text  }\n\n${  generatedUrl}`)
          }
        }
      }
    }
  })
}


const task = cron.schedule('* * * * *', () => {

  start()
  const stores = ['inestaku', 'ifootballstore']
  for (const store of stores) {
    init(store)
  }
});



task.start();

