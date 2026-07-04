import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'generate-visa-docs', 30)
  if (limited) return limited
  const body = await req.json();

  const res = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.text();
  return NextResponse.json({ success: true, data });
}
