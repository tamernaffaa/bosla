import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivsuscmeelotkcibziya.supabase.co/'; // ضع عنوان URL الخاص بـ Supabase هنا
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2c3VzY21lZWxvdGtjaWJ6aXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NjUwMzUsImV4cCI6MjA0NzU0MTAzNX0.THSMPMAZuQ-q8_tzo4DF7EtZMgIVI__sgSaGDKfOxqY'; // ضع مفتاح الوصول الخاص بك هنا
export const supabase = createClient(supabaseUrl, supabaseKey);
