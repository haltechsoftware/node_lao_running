import db from '../models'
import faker from 'faker'
import bcrypt from 'bcryptjs'

db.Package.findAll()
  .then(packages => {
    bcrypt.hash('11111111', 10).then(encryptedPassword => {
      packages.forEach((pack) => createPackageResult(10, pack, encryptedPassword));
    }).catch(error => {
      console.log("bcrypt.hash: ", error);
    })
    return true
  }).catch(error => {
    console.log("Package.findAll: ", error);
  });

/// Create package result
function createPackageResult(count, pack, encryptedPassword) {

  const fakerBuilder = Array.from(Array(count).keys());

  const userFakers = [];
  fakerBuilder.forEach(() => {
    userFakers.push(db.User.create({
      name: faker.name.firstName(),
      email: faker.internet.email(),
      phone: faker.datatype.number({
        min: 20000000,
        max: 99999999
      }),
      is_active: 1,
      password: encryptedPassword
    }));
  });


  function userCreatedState(user) {
    user.createUserProfile({
      name: user.name,
      surname: faker.name.lastName(),
      gender: faker.random.arrayElement(['male', 'female']),
      range: faker.random.arrayElement(['15', '42', '100', '200']),
      dob: faker.date.past(20),
      bib: user.id.toString().padStart(5, '0'),
      national_id: 126,
      profile_image: faker.image.imageUrl(),
      profile_image_id: 'AAAAAAAA'
    });

    user.createUserPackage({
      total: 3,
      package_id: pack.id,
      status: 'success',
      invoice_id: '964e7f7a25',
      transaction_id: '007110268a',
      terminal_id: '2fa384dbd6',
      ticket_id: 'F5DNQ7F065BB'
    });

    user.addRoles([2])

    user.update({
      package_id: pack.id
    })


    let runnerResultFakers = [];
    fakerBuilder.forEach(() => {
      runnerResultFakers.push(
        user.createRunResult({
          time: faker.datatype.number({
            min: 1000,
            max: 6200
          }),
          range: (Math.random() * (5 - 0.02) + 0.0200).toFixed(2),
          image: faker.image.imageUrl(),
          image_id: 'AAAAAAAA',
          status: "approve",
          approved_by: 1
        })
      );
    });

    Promise.all(runnerResultFakers).then((runnerResults) => {
      const summary = runnerResults.reduce((pre, curr) => {
        let total_range = parseFloat(pre.total_range) + parseFloat(curr.dataValues.range);
        let total_time = pre.total_time + curr.dataValues.time;
        return {
          total_range,
          total_time,
        }
      }, {
        total_range: 0,
        total_time: 0,
      });
      user.createRanking({
        total_range: summary.total_range,
        total_time: summary.total_time
      })
    });
  }

  Promise.all(userFakers).then((users) => users.forEach((user) => userCreatedState(user)));
}