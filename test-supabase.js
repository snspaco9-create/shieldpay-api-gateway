require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase connection...');
console.log('URL:', process.env.SUPABASE_URL);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function test() {
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('✅ Connected! Users count:', data);
    }
}

test();