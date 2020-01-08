const aws = require('aws-sdk')
const dotenv = require('dotenv')

dotenv.config()

module.exports = async function () {
  const bucket = 'image-recognition-gergohrubo'
  try {
    aws.config.setPromisesDependency()
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    })
    const s3 = new aws.S3()
    const response = await s3.listObjectsV2({
      Bucket: bucket
    }).promise()
    const url = `http://${bucket}.s3.eu-central-1.amazonaws.com/${response.Contents[0].Key}`
    return url
  } catch (error) {
    console.error(error)
  }
}