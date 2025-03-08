import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvomiyslmvppsltkimlv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2b21peXNsbXZwcHNsdGtpbWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0Njk5MjUsImV4cCI6MjA1NzA0NTkyNX0.n2_OiYDmUinbayrk0eKwC-DmI2czfUOtDBjCMILFbsQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
