module.exports = function (sequelize, DataTypes) {
  return sequelize.define('development', {
    data: {
      defaultValue: {
        description: 'No description... yet.',
        name: 'New Development'
      },
      type: DataTypes.JSON
    },
    geom: DataTypes.GEOMETRY('POINT', 4326),
    public: {
      defaultValue: false,
      type: DataTypes.BOOLEAN
    }
  }, {
    freezeTableName: true
  })
}
