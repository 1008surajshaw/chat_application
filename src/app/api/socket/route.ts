import { NextRequest, NextResponse } from 'next/server';
import { initSocketServer } from '@/utils/socket-server';

export async function GET(req: NextRequest) {
  try {
    // Initialize Socket.IO server
    const io = initSocketServer();
    
    if (!io) {
      throw new Error('Failed to initialize socket server');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json({ success: false, error: 'Failed to initialize socket' }, { status: 500 });
  }
}
