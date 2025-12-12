// lib/actions.ts
'use server';

import { db } from "@/lib/db/db";
import { revenue, customers } from "@/lib/db/schema";
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// --- Revenue Actions ---
export async function addRevenueAction(prevState: any, formData: FormData) {
  const amount = Number(formData.get('amount'));
  const month = formData.get('month') as string;

  try {
    await db.insert(revenue).values({ amount, month });
    revalidatePath('/');
    return { success: true, message: "Revenue added successfully!" };
  } catch (e) {
    return { success: false, message: "Failed to add revenue." };
  }
}

// --- Customer Actions ---
export async function addCustomerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  try {
    await db.insert(customers).values({ name, email });
    revalidatePath('/customers'); // Forces the UI to refresh
  } catch (e) {
    console.error(e);
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath('/customers'); // Forces the UI to refresh
  } catch (e) {
    console.error(e);
  }
}