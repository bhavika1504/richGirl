import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from './models/Category.js';

dotenv.config();

const categories = [
    { name: '3 Piece Dress', type: 'indian' },
    { name: '2 Piece Dress', type: 'indian' },
    { name: 'Kurtis', type: 'indian' },
    { name: 'Tunics', type: 'western' },
    { name: 'Tops', type: 'western' },
    { name: 'Shirts', type: 'western' },
    { name: 'Jumpsuits', type: 'western' },
    { name: 'Jeans', type: 'western' },
    { name: 'Cord Sets-Western', type: 'western' },
    { name: 'Cord Sets-Indian', type: 'indian' },
    { name: 'Western Dresses', type: 'western' },
    { name: 'Skirts', type: 'western' },
    { name: 'T-shirts', type: 'western' },
    { name: 'Shorts', type: 'western' },
    { name: 'Pants', type: 'western' }
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const cat of categories) {
            const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await Category.findOneAndUpdate(
                { slug },
                {
                    name: cat.name,
                    type: cat.type,
                    slug,
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
