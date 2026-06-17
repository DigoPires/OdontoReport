import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - List all reports for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists (after database reset)
    let user =
      (await prisma.user.findUnique({ where: { id: session.user.id } })) ||
      (await prisma.user.findUnique({ where: { googleId: session.user.id } }));

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
    const { paciente, dente, data, diagnostico, formData } = body;

    if (!paciente || !dente || !data || !diagnostico) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        userId: user.id,
        patientName: paciente,
        tooth: dente,
        date: new Date(data),
        diagnosis: diagnostico,
        formData: formData || {},
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
