const predictImage = require('./clarifai/predictImage')

predictImage("./images/apple.jpg")
  .then(guess => console.log('the returned value', guess))
  .catch(error => console.error(error))