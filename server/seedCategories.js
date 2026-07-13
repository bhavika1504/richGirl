import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from './models/Category.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const categories = [
    { name: '3 Piece Dress', type: 'indian', image: '/assets/3PieceDress.jpg' },
    { name: '2 Piece Dress', type: 'indian', image: '/assets/2PieceDress.jpg' },
    { name: 'Kurtis', type: 'indian', image: '/assets/kurti.jpg' },
    { name: 'Tunics', type: 'western', image: '/assets/tunic.jpg' },
    { name: 'Tops', type: 'western', image: '/assets/top.jpg' },
    { name: 'Shirts', type: 'western', image: '/assets/shirt.jpg' },
    { name: 'Jeans', type: 'western', image: '/assets/jeans.jpg' },
    { name: 'Cord Sets-Western', type: 'western', image: '/assets/westernCordSet.jpg' },
    { name: 'Cord Sets-Indian', type: 'indian', image: '/assets/indianCordSet.jpg' },
    { name: 'Western Dresses', type: 'western', image: '/assets/westernDress.jpg' },
    { name: 'Skirts', type: 'western', image: '/assets/skirt.jpg' },
    { name: 'T-shirts', type: 'western', image: '/assets/tshirt.jpg' },
    { name: 'Shorts', type: 'western', image: '/assets/shorts.jpg' },
    { name: 'Pants', type: 'western', image: '/assets/pants.jpg' }
];

async function seedCategories() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        const dbName = process.env.MONGO_DB_NAME || 'RichGirl_Test';
        await mongoose.connect(uri, { dbName });
        console.log(`Connected to MongoDB database: ${dbName}`);

        await Category.deleteOne({ slug: 'jumpsuits' });

        for (const cat of categories) {
            const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await Category.findOneAndUpdate(
                { slug },
                {
                    name: cat.name,
                    type: cat.type,
                    slug,
                    image: cat.image,
                    isActive: true
                },
                { upsert: true, new: true }
            );
        }

        console.log('Categories seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seedCategories();
