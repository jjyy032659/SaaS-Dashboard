// app/customers/page.tsx
import { db } from "@/lib/db/db";
import { customers } from "@/lib/db/schema";
import { addCustomerAction, deleteCustomerAction } from "@/lib/actions";
import { Trash2, UserPlus, Search as SearchIcon } from "lucide-react";
import { sql, ilike, or, count } from 'drizzle-orm';
import SearchComponent from '../ui/search'; // Reuse your existing search bar

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  // 1. Await searchParams for Next.js 15/16 compatibility
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const itemsPerPage = 5; // We'll show 5 customers per page
  const offset = (currentPage - 1) * itemsPerPage;

  // 2. Build the dynamic query with search filtering
  const searchTerm = `%${query}%`;
  const baseQuery = db.select().from(customers);
  
  const filteredQuery = query 
    ? baseQuery.where(or(ilike(customers.name, searchTerm), ilike(customers.email, searchTerm)))
    : baseQuery;

  // 3. Execute Fetch and get Total Count for pagination
  const [allCustomers, totalCountResult] = await Promise.all([
    filteredQuery.limit(itemsPerPage).offset(offset).orderBy(customers.createdAt),
    db.select({ count: count() }).from(customers).where(
        query ? or(ilike(customers.name, searchTerm), ilike(customers.email, searchTerm)) : undefined
    )
  ]);

  const totalPages = Math.ceil((totalCountResult[0]?.count || 0) / itemsPerPage);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-500">Search and manage your {totalCountResult[0]?.count} clients.</p>
        </div>
        <div className="w-72">
           <SearchComponent placeholder="Search name or email..." />
        </div>
      </div>

      {/* --- ADD CUSTOMER FORM (Same as before) --- */}
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <form action={addCustomerAction} className="flex gap-4">
          <input name="name" placeholder="Full Name" className="border p-2 rounded-md w-full" required />
          <input name="email" type="email" placeholder="Email" className="border p-2 rounded-md w-full" required />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
            <UserPlus size={18} /> Add
          </button>
        </form>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white shadow-sm rounded-xl border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {allCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{customer.name}</td>
                <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                <td className="px-6 py-4 text-right">
                  <form action={async () => { 'use server'; await deleteCustomerAction(customer.id); }}>
                    <button className="text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION UI --- */}
      <div className="mt-6 flex justify-center gap-2">
         {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
           <a
             key={p}
             href={`?query=${query}&page=${p}`}
             className={`px-4 py-2 border rounded-md ${currentPage === p ? 'bg-blue-600 text-white' : 'bg-white'}`}
           >
             {p}
           </a>
         ))}
      </div>
    </div>
  );
}