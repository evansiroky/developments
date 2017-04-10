const S3 = require('aws-sdk/clients/s3')

const env = require('../util/env')

const S3_BUCKET = env.S3_BUCKET

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('development', {
    data: {
      defaultValue: {
        description: 'No description... yet.',
        name: 'New Development',
        statuses: []
      },
      type: DataTypes.JSON
    },
    geom: DataTypes.GEOMETRY('POINT', 4326)
  }, {
    freezeTableName: true,
    hooks: {
      beforeDestroy: (instance, options) => {
        return new Promise((resolve, reject) => {
          if (!instance.data.picture) return resolve()

          const s3 = new S3()
          s3.deleteObject({
            Bucket: S3_BUCKET,
            Key: instance.data.picture.replace(`https://${S3_BUCKET}.s3.amazonaws.com/`, '')
          }, (err, data) => {
            if (err) {
              console.error(err)
              return reject(err)
            }
            resolve()
          })
        })
      }
    }
  })
}
