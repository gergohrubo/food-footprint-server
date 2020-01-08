const predictImage = require('./clarifai/predictImage')
const getImagesFromAWS = require('./aws/s3storage')

getImagesFromAWS()
  .then(url => predictImage(url))
  .then(guess => console.log('the guess is', guess))
  .catch(error => console.error(error))