import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
    isAdmin: Boolean
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || 'RichGirl_Test'
        });
        console.log('Connected to DB');

        const result = await User.updateMany(
            { isAdmin: true, role: { $exists: false } },
            { $set: { role: 'admin' } }
        );
        console.log('MIGRATION_RESULT:', result);

        const check = await User.findOne({ email: 'admin@richgirl.com' });
        console.log('Admin Check:', check);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
