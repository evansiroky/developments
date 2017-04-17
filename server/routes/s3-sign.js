const S3 = require('aws-sdk/clients/s3')

const auth = require('../auth')
const env = require('../util/env').env

const S3_BUCKET = env.S3_BUCKET

module.exports = (app) => {
  app.get('/sign-s3', [auth.authRequired, auth.adminRequired], (req, res) => {
    const s3 = new S3()
    const fileName = req.query['file-name']
    const fileType = req.query['file-type']
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    }

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err){
        console.error(err)
        return res.status(500).send({error: err})
      }
      const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
      }
      res.write(JSON.stringify(returnData))
      res.end()
    })
  })
}
