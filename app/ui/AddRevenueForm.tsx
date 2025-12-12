// app/ui/AddRevenueForm.tsx
'use client';

// 💡 FIX: Import from 'react' and use the new name: useActionState
import { useActionState } from 'react'; 
import { useFormStatus } from 'react-dom'; // Keep this for the SubmitButton

// Define the state type for the form
interface FormState {
  message: string;
  success: boolean;
}

// Separate component for the submit button to show pending state (remains the same)
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
      disabled={pending}
    >
      {pending ? 'Saving...' : 'Add New Record'}
    </button>
  );
}

// The main form component
export default function AddRevenueForm(props: { addRevenueAction: (prevState: FormState, formData: FormData) => Promise<FormState> }) {
  // 💡 FIX: useActionState replaces useFormState

  const { addRevenueAction } = props;
  const [state, formAction] = useActionState(addRevenueAction, { message: '', success: false });

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4 max-w-lg">
      <h3 className="text-xl font-bold border-b pb-2">Create New Revenue Record</h3>
      
      {/* 1. The form uses the formAction from useActionState (remains the same) */}
      <form action={formAction} className="space-y-4">
        
        {/* Input: Amount (JSX remains the same) */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (USD)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Input: Month/Label (JSX remains the same) */}
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month Label (e.g., July 2024)</label>
          <input
            id="month"
            name="month"
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <SubmitButton />
        
        {/* Feedback Messages (remains the same) */}
        {state.message && (
          <p className={`text-sm font-medium ${state.success ? 'text-green-600' : 'text-red-600'}`}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}