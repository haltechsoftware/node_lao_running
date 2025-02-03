import db from '../models'
import faker from 'faker'
import bcrypt from 'bcryptjs'

seed()

async function seed() {
    const encryptedPassword = await bcrypt.hash('11111111', 10)

    for (let i = 0; i < 10; i++) {
        const user = await db.User.create({
            name: faker.name.firstName(),
            email: faker.internet.email(),
            phone: faker.datatype.number({
                min: 20000000,
                max: 99999999
            }),
            is_active: 1,
            password: encryptedPassword
        })

        await user.createUserProfile({
            name: user.name,
            surname: faker.name.lastName(),
            gender: faker.random.arrayElement(['male', 'female']),
            range: 'free',
            dob: faker.date.past(20),
            bib: user.id.toString().padStart(5, '0'),
            national_id: 126,
            profile_image: faker.image.imageUrl(),
            profile_image_id: 'AAAAAAAA'
        });

        for (let i = 0; i < 10; i++) {
            await user.createRunResult({
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
        }

        const totalAmount = await db.RunResult.findOne({
            where: {
                user_id: user.id
            },
            attributes: [
                'user_id',
                [db.sequelize.fn('sum', db.sequelize.col('range')), 'total_range'],
                [db.sequelize.fn('sum', db.sequelize.col('time')), 'total_time'],
            ],
            group: ['user_id'],
        });

        await user.createRanking({
            total_range: totalAmount.dataValues.total_range,
            total_time: totalAmount.dataValues.total_time
        })
    }
}