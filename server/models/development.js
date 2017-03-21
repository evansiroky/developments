module.exports = function (sequelize, DataTypes) {
  return sequelize.define('development', {
    data: DataTypes.JSON,
    geom: DataTypes.GEOMETRY('POINT', 4326)
  }, {
    freezeTableName: true
  })
}
