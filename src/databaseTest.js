console.log('hello')
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://user:pass@localhost:5432/taskmanagement');

class User extends Model {}
User.init({
  username: DataTypes.STRING,
  birthday: DataTypes.DATE
}, { sequelize, modelName: 'user' });

sequelize.sync()
  .then(() => User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20)
  }))
  .then(jane => {
    console.log(jane.toJSON());
  });
