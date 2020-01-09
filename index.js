const predictImage = require('./clarifai/predictImage')
const { getImgURL, uploadImg } = require('./aws/s3storage')

getImgURL()
  .then(url => predictImage(url))
  .then(guess => console.log('the guess is', guess))
  .catch(error => console.error(error))

uploadImg('./images/orange.jpg', 'orange.jpg')