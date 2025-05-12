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
if (isErrorWithMessage(err)) {
  message = err.message;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}
return NextResponse.json({ error: message }, { status: 500 });
  }
}
