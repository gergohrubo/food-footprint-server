const aws = require('aws-sdk')
const dotenv = require('dotenv')
const fs = require('fs');

dotenv.config()

async function getImgURL() {
  const bucket = process.env.BUCKET_NAME
  try {
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    })
    const response = await s3.listObjectsV2({
      Bucket: bucket
    }).promise()
    console.log('the contents:', response)
    const url = `http://${bucket}.s3.eu-central-1.amazonaws.com/${response.Contents[1].Key}`
    return url
  } catch (error) {
    console.error(error)
  }
}

async function uploadImg(imgSrc, imgName) {
  const fileContent = fs.readFileSync(imgSrc);
  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  })
  s3.upload({
    Bucket: process.env.BUCKET_NAME,
    Key: imgName,
    Body: fileContent,
    ACL: "public-read-write"
  }, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  })
}

module.exports = { getImgURL, uploadImg }