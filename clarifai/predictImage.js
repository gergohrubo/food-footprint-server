const dotenv = require('dotenv')
const Clarifai = require('clarifai')
const image2base64 = require('image-to-base64');

dotenv.config()

const clarifaiApp = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
})

async function predictImage(imgURI) {
  try {
    const imgBytes = await image2base64(imgURI)
    const prediction = await clarifaiApp.models.predict(Clarifai.FOOD_MODEL, { base64: imgBytes })
    const guesses = prediction.outputs[0].data
    return guesses
  } catch (error) {
    console.error(error)
  }
}

module.exports = predictImage