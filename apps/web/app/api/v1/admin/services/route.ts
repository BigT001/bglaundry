import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const defaultServices = [
  // Clothing category
  { name: 'T-Shirt / Polo', category: 'Clothing', icon: 'tshirt-crew', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 700 },
  { name: 'Dress Shirt', category: 'Clothing', icon: 'tshirt-v', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 700, ironPrice: 400, washIronPrice: 1000 },
  { name: 'Trouser', category: 'Clothing', icon: 'hanger', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 700 },
  { name: 'Jeans', category: 'Clothing', icon: 'hanger', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 700, ironPrice: 400, washIronPrice: 1000 },
  { name: 'Shorts', category: 'Clothing', icon: 'hanger', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 300, ironPrice: 200, washIronPrice: 500 },
  { name: 'Casual/Formal Shirt', category: 'Clothing', icon: 'tshirt-v', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 800 },
  { name: 'Blouse', category: 'Clothing', icon: 'tshirt-v', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 800 },
  { name: 'Dress', category: 'Clothing', icon: 'hanger', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1300, ironPrice: 700, washIronPrice: 2000 },
  { name: 'Two-Piece Suit', category: 'Clothing', icon: 'tie', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 2500, ironPrice: 1200, washIronPrice: 3500 },
  { name: 'Blazer', category: 'Clothing', icon: 'hanger', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1000, ironPrice: 600, washIronPrice: 1500 },
  { name: 'Senator Wear (2 pcs)', category: 'Clothing', icon: 'account', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1000, ironPrice: 500, washIronPrice: 1500 },
  { name: 'Agbada (Complete Set)', category: 'Clothing', icon: 'account', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 2500, ironPrice: 1200, washIronPrice: 3500 },
  { name: 'Kaftan', category: 'Clothing', icon: 'account', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1300, ironPrice: 700, washIronPrice: 2000 },
  { name: 'Jacket', category: 'Clothing', icon: 'hanger', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1000, ironPrice: 600, washIronPrice: 1500 },
  { name: 'Tie', category: 'Clothing', icon: 'tie', hasWash: false, hasIron: true, hasWashIron: true, washPrice: 0, ironPrice: 300, washIronPrice: 300 },

  // Household category
  { name: 'Bed Sheet', category: 'Household', icon: 'bed-empty', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 1000, ironPrice: 0, washIronPrice: 1500 },
  { name: 'Duvet (Small)', category: 'Household', icon: 'bed-double-outline', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 2500, ironPrice: 0, washIronPrice: 3000 },
  { name: 'Duvet (Medium)', category: 'Household', icon: 'bed-double-outline', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 3500, ironPrice: 0, washIronPrice: 4000 },
  { name: 'Duvet (Large/King)', category: 'Household', icon: 'bed-double-outline', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 3500, ironPrice: 0, washIronPrice: 4000 },
  { name: 'Blanket', category: 'Household', icon: 'bed-outline', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 3000, ironPrice: 0, washIronPrice: 3500 },
  { name: 'Pillow', category: 'Household', icon: 'bed-outline', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 600, ironPrice: 0, washIronPrice: 800 },
  { name: 'Curtain (Per Panel)', category: 'Household', icon: 'bed-outline', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 1500, ironPrice: 0, washIronPrice: 2000 },
  { name: 'Bath Towel', category: 'Household', icon: 'hanger', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 600, ironPrice: 0, washIronPrice: 800 },

  // Additional category
  { name: 'Stain Removal', category: 'Additional', icon: 'water-percent', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 1000, ironPrice: 0, washIronPrice: 0 },
  { name: 'Spot Cleaning', category: 'Additional', icon: 'selection-ellipse', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 500, ironPrice: 0, washIronPrice: 0 },
  { name: 'Fabric Softener Treatment', category: 'Additional', icon: 'spray', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 200, ironPrice: 0, washIronPrice: 0 },
  { name: 'Premium Fragrance Finish', category: 'Additional', icon: 'flower-outline', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 200, ironPrice: 0, washIronPrice: 0 },
  { name: 'Folding Only', category: 'Additional', icon: 'content-save-move-outline', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 200, ironPrice: 0, washIronPrice: 0 },
  { name: 'Shoe Cleaning', category: 'Additional', icon: 'shoe-sneaker', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 4000, ironPrice: 0, washIronPrice: 0 },
  { name: 'Bag Cleaning', category: 'Additional', icon: 'bag-personal', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 4000, ironPrice: 0, washIronPrice: 0 },
  { name: 'Wedding Gown Care', category: 'Additional', icon: 'cards-heart', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 15000, ironPrice: 0, washIronPrice: 0 },
];

export async function GET(request: NextRequest) {
  try {
    const reseed = request.nextUrl.searchParams.get('reseed') === 'true';
    if (reseed) {
      await prisma.service.deleteMany({});
    }

    let services = await prisma.service.findMany({
      orderBy: { name: 'asc' },
    });

    if (services.length === 0 || reseed) {
      await prisma.service.createMany({
        data: defaultServices,
      });
      services = await prisma.service.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('[Services GET Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      id, 
      name, 
      category, 
      icon, 
      hasWash, 
      hasIron, 
      hasWashIron, 
      washPrice, 
      ironPrice, 
      washIronPrice 
    } = data;

    if (!name || !category || !icon) {
      return NextResponse.json(
        { error: 'Fields name, category and icon are required' },
        { status: 400 },
      );
    }

    let service;
    if (id) {
      // Update
      service = await prisma.service.update({
        where: { id },
        data: {
          name,
          category,
          icon,
          hasWash: hasWash === undefined ? true : !!hasWash,
          hasIron: hasIron === undefined ? true : !!hasIron,
          hasWashIron: hasWashIron === undefined ? true : !!hasWashIron,
          washPrice: parseFloat(washPrice) || 0,
          ironPrice: parseFloat(ironPrice) || 0,
          washIronPrice: parseFloat(washIronPrice) || 0,
        },
      });
    } else {
      // Create
      service = await prisma.service.create({
        data: {
          name,
          category,
          icon,
          hasWash: hasWash === undefined ? true : !!hasWash,
          hasIron: hasIron === undefined ? true : !!hasIron,
          hasWashIron: hasWashIron === undefined ? true : !!hasWashIron,
          washPrice: parseFloat(washPrice) || 0,
          ironPrice: parseFloat(ironPrice) || 0,
          washIronPrice: parseFloat(washIronPrice) || 0,
        },
      });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error('[Services POST Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
