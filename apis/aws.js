const aws = require('aws-sdk')
const dotenv = require('dotenv')

dotenv.config()

async function getImg(imgName) {
  const bucket = process.env.BUCKET_NAME
  try {
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    })
    const response = await s3.getObject({
      Bucket: bucket,
      Key: imgName
    }).promise()
    console.log('the contents:', response)
    return response
  } catch (error) {
    console.error(error)
  }
}

async function uploadImg(fileBuffer, imgName) {
  try {
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    })
    await s3.upload({
      Bucket: process.env.BUCKET_NAME,
      Key: imgName,
      Body: fileBuffer,
      ACL: "public-read-write"
    }).promise()
  }
  catch (error) {
    console.error(error)
  }
}

module.exports = { getImg, uploadImg }