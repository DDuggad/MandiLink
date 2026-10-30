import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Mandi } from '../models/Mandi.js';
import { Commodity } from '../models/Commodity.js';
import { Price } from '../models/Price.js';
import { Transporter } from '../models/Transporter.js';
import { Admin } from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import {
  SEED_MANDIS,
  SEED_COMMODITIES,
  SEED_TRANSPORTERS,
  generatePriceHistory,
} from './data.js';

dotenv.config();

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not provided. Cannot seed MongoDB Atlas.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');

    console.log('🧹 Clearing existing collections...');
    await Mandi.deleteMany({});
    await Commodity.deleteMany({});
    await Price.deleteMany({});
    await Transporter.deleteMany({});
    await Admin.deleteMany({});

    console.log('🌱 Inserting pilot mandis...');
    const insertedMandis = await Mandi.insertMany(SEED_MANDIS);
    const mandiMap = new Map(insertedMandis.map((m) => [m.code, m._id]));

    console.log('🌱 Inserting pilot commodities...');
    const insertedCommodities = await Commodity.insertMany(SEED_COMMODITIES);
    const commMap = new Map(insertedCommodities.map((c) => [c.code, c._id]));

    console.log('🌱 Inserting transporters...');
    await Transporter.insertMany(SEED_TRANSPORTERS);

    console.log('🌱 Generating and inserting 90-day price histories...');
    const rawPrices = generatePriceHistory();
    const pricesToInsert = rawPrices.map((p) => ({
      mandiId: mandiMap.get(p.mandiCode),
      commodityId: commMap.get(p.commodityCode),
      variety: p.variety,
      date: new Date(p.date),
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      modalPrice: p.modalPrice,
      unit: p.unit,
      arrivals: p.arrivals,
      source: 'seed',
    }));
    await Price.insertMany(pricesToInsert);

    console.log('🌱 Creating default admin account (admin / admin123)...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    await Admin.create({
      username: 'admin',
      passwordHash,
      role: 'admin',
    });

    console.log(`🎉 Seeding complete!`);
    console.log(`   - Mandis: ${insertedMandis.length}`);
    console.log(`   - Commodities: ${insertedCommodities.length}`);
    console.log(`   - Transporters: ${SEED_TRANSPORTERS.length}`);
    console.log(`   - Price records: ${pricesToInsert.length}`);
    console.log(`   - Default Admin created: username="admin" password="admin123"`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

runSeed();
