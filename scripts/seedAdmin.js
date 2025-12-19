const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');
const connectDB = require('../database/db'); // db.js yoluna dikkat

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const [email, password] = process.argv.slice(2);

        if (!email || !password) {
            console.error('Kullanım: node scripts/seedAdmin.js <email> <password>');
            process.exit(1);
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('Bu email ile kayıtlı kullanıcı zaten var.');
            // Eğer zaten varsa ve admin değilse, admin yapabiliriz.
            if (userExists.role !== 'admin') {
                userExists.role = 'admin';
                await userExists.save();
                console.log('Kullanıcı admin rolüne yükseltildi.');
            }
            process.exit(0);
        }

        const user = await User.create({
            name: 'Super Admin',
            email,
            password,
            role: 'admin' // Direkt admin olarak oluşturuyoruz
        });

        console.log(`Admin başarıyla oluşturuldu: ${user.email}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
