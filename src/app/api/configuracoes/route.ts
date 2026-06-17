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
    let user =
      (await prisma.user.findUnique({ where: { id: session.user.id } })) ||
      (await prisma.user.findUnique({ where: { googleId: session.user.id } }));

    // Create user if not exists (after database reset)
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          googleId: session.user.id,
        },
      });
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

    let user =
      (await prisma.user.findUnique({ where: { id: session.user.id } })) ||
      (await prisma.user.findUnique({ where: { googleId: session.user.id } }));

    // Create user if not exists (after database reset)
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          googleId: session.user.id,
        },
      });
    }

    const body = await req.json();
    const {
      clinicName,
      logoUrl,
      logoSize,
      primaryColor,
      socialInstagram,
      socialWhatsapp,
      socialGoogle,
      socialTwitter,
      socialFacebook,
      socialLinkedin,
      socialTiktok,
      socialYoutube,
      socialWebsite,
      layoutTemplate,
    } = body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        clinicName,
        logoUrl,
        logoSize: logoSize || '80',
        primaryColor,
        socialInstagram,
        socialWhatsapp,
        socialTwitter,
        socialFacebook,
        socialLinkedin,
        socialTiktok,
        socialYoutube,
        socialGoogle,
        socialWebsite,
        layoutTemplate,
      },
      create: {
        userId: user.id,
        clinicName,
        logoUrl,
        logoSize: logoSize || '80',
        primaryColor: primaryColor || '#2563EB',
        socialInstagram,
        socialWhatsapp,
        socialTwitter,
        socialFacebook,
        socialLinkedin,
        socialTiktok,
        socialYoutube,
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
