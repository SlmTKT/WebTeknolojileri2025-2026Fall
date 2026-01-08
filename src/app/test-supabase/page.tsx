import { createClient } from '@/utils/supabase/server';

export default async function Page() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
            {user ? (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p>✅ Connected!</p>
                    <p>Logged in as: {user.email}</p>
                </div>
            ) : (
                <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    <p>✅ Connected to Supabase!</p>
                    <p>No user currently logged in (this is expected if you haven't logged in yet).</p>
                </div>
            )}
        </div>
    );
}
