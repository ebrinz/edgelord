import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/createClient';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('exercises').select('*');
    if (error) throw error;
    return NextResponse.json({ exercises: data || [] });
  } catch (err: unknown) {
    let message = 'Failed to fetch exercises';
if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
  message = (err as any).message;
}
return NextResponse.json({ error: message }, { status: 500 });
  }
}
