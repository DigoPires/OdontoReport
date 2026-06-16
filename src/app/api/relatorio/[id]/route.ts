import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get a specific report
export async function GET(req: NextRequest, context: any) {
  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await prisma.report.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a report
export async function PUT(req: NextRequest, context: any) {
  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { paciente, dente, data, diagnostico, formData } = body;

    // Verify ownership
    const existingReport = await prisma.report.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: {
        patientName: paciente || existingReport.patientName,
        tooth: dente || existingReport.tooth,
        date: data ? new Date(data) : existingReport.date,
        diagnosis: diagnostico || existingReport.diagnosis,
        formData: formData || existingReport.formData,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a report
export async function DELETE(req: NextRequest, context: any) {
  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingReport = await prisma.report.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    await prisma.report.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
