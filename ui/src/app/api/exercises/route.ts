import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/createClient';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('exercises').select('*');
    if (error) throw error;
    return NextResponse.json({ exercises: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch exercises' }, { status: 500 });
  }
}
