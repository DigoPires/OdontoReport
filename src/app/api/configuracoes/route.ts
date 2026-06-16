import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve authenticated user by id or Google id fallback
    const user =
      (await prisma.user.findUnique({ where: { id: session.user.id } })) ||
      (await prisma.user.findUnique({ where: { googleId: session.user.id } }));

    if (!user) {
      return NextResponse.json({ error: 'User not found. Please logout and login again.' }, { status: 404 });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if not exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          primaryColor: '#2563EB',
          layoutTemplate: 'padrao',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user =
      (await prisma.user.findUnique({ where: { id: session.user.id } })) ||
      (await prisma.user.findUnique({ where: { googleId: session.user.id } }));

    if (!user) {
      return NextResponse.json({ error: 'User not found. Please logout and login again.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      clinicName,
      logoUrl,
      primaryColor,
      socialInstagram,
      socialWhatsapp,
      socialGoogle,
      socialWebsite,
      layoutTemplate,
    } = body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        clinicName,
        logoUrl,
        primaryColor,
        socialInstagram,
        socialWhatsapp,
        socialGoogle,
        socialWebsite,
        layoutTemplate,
      },
      create: {
        userId: user.id,
        clinicName,
        logoUrl,
        primaryColor: primaryColor || '#2563EB',
        socialInstagram,
        socialWhatsapp,
        socialGoogle,
        socialWebsite,
        layoutTemplate: layoutTemplate || 'padrao',
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
