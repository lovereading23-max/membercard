import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized 1' }, { status: 401 });
    // }

    // Check if the booking settings exist and belong to the user
    const bookingSettings = await db.bookingSettings.findUnique({
      where: { id: params.id }
    });

    if (!bookingSettings) {
      return NextResponse.json({ error: 'Booking settings not found' }, { status: 404 });
    }

    // if (bookingSettings.userId !== session.user.id) {
    //   return NextResponse.json({ error: 'Unauthorized 2' }, { status: 401 });
    // }

    const timeSlots = await db.timeSlot.findMany({
      where: { bookingSettingsId: params.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized 32' }, { status: 401 });
    // }

    const body = await request.json();
    const {
      dayOfWeek,
      startTime,
      endTime,
      isAvailable,
      maxBookings
    } = body;

    // Check if the booking settings exist and belong to the user
    const bookingSettings = await db.bookingSettings.findUnique({
      where: { id: params.id }
    });

    if (!bookingSettings) {
      return NextResponse.json({ error: 'Booking settings not found' }, { status: 404 });
    }

    // if (bookingSettings.userId !== session.user.id) {
    //   return NextResponse.json({ error: 'Unauthorized 4' }, { status: 401 });
    // }

    // Validate time slot
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ error: 'Invalid day of week' }, { status: 400 });
    }

    if (startTime >= endTime) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    const timeSlot = await db.timeSlot.create({
      data: {
        bookingSettingsId: params.id,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable ?? true,
        maxBookings: maxBookings || 1
      }
    });

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error('Error creating time slot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}