const { Router } = require('express')
const multer = require('multer')
const { uploadImg, getImgURL } = require('../aws/s3storage')
const predictImage = require('../clarifai/predictImage')

const upload = multer()

const router = new Router()

router.post('/image', upload.single('image'), async (req, res, next) => {
  if (req.file) {
    await uploadImg(req.file.buffer, 'newimage.jpg')
    const imgURL = await getImgURL()
    const guess = await predictImage(imgURL)
    res.send(guess)
  } else {
    res.status(400).send('Please support a valid image')
  }
})

module.exports = router