import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from './models/Category.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const categories = [
    { name: '3-Piece Suits', type: 'indian', slug: '3-piece-suits', image: '/assets/3PieceDress.jpg' },
    { name: 'Cord sets', type: 'indian', slug: 'cord-sets-indian', image: '/assets/indianCordSet.jpg' },
    { name: 'Tunics', type: 'indian', slug: 'tunics-indian', image: '/assets/tunic.jpg' },
    { name: 'Kurtis', type: 'indian', slug: 'kurtis', image: '/assets/kurti.jpg' },
    
    { name: 'Tops', type: 'western', slug: 'tops-western', image: '/assets/top.jpg' },
    { name: 'Bottoms', type: 'western', slug: 'bottoms-western', image: '/assets/jeans.jpg' },
    { name: 'Cord sets', type: 'western', slug: 'cord-sets-western', image: '/assets/westernCordSet.jpg' },
    { name: 'Dresses', type: 'western', slug: 'dresses-western', image: '/assets/dresses.jpg' }
];

async function seedCategories() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        const dbName = process.env.MONGO_DB_NAME || 'RichGirl_Test';
        await mongoose.connect(uri, { dbName });
        console.log(`Connected to MongoDB database: ${dbName}`);

        // Deactivate all first
        await Category.updateMany({}, { isActive: false });

        for (const cat of categories) {
            await Category.findOneAndUpdate(
                { slug: cat.slug },
                {
                    name: cat.name,
                    type: cat.type,
                    slug: cat.slug,
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
