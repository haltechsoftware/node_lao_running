import db from '../models'

db.sequelize.sync({
  force: true
}).then(() => {
  console.log('refresh database success');
})