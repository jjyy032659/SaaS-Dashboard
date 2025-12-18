// app/food-library/SeedButtonClient.tsx
'use client';

import {  useFormStatus } from 'react-dom';

import { useActionState } from 'react';
import { Database, Plus } from 'lucide-react';

interface FormState {
    message: string;
    success: boolean;
}

interface SeedButtonClientProps {
    seedAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 text-sm"
        >
            {pending ? 'Seeding...' : <>
                <Database size={16} /> Seed Default Foods
            </>}
        </button>
    );
}

export default function SeedButtonClient({ seedAction }: SeedButtonClientProps) {
    const [state, formAction] = useActionState(seedAction, { success: false, message: '' });

    return (
        <div className="flex flex-col items-end">
            <form action={formAction}>
                <SubmitButton />
            </form>
            {state.message && (
                <p className={`mt-2 text-xs font-medium ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </div>
    );
}