// app/invoices/page.tsx
import { db } from "@/lib/db/db";
import { revenue, type Revenue } from "@/lib/db/schema";
import SearchComponent from '../ui/search';
import { sql } from 'drizzle-orm';

// Define the type for the data structure
type Invoice = Revenue;

// IMPORTANT: In Next.js 15+, searchParams is now a Promise!
export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  // 1. Await the searchParams Promise to get the actual query value
  const params = await searchParams;// Await the searchParams Promise to get the actual query value
  const query = params?.query || '';// Default to an empty string if no query is provided
  
  let invoiceData: Invoice[] = [];// Initialize an empty array to hold the invoice data

  try {
    // 2. Build the base query
    let dbQuery = db.select().from(revenue);// Build the base query// Select all records from the revenue table//

    // 3. Apply filtering if there's a search query
    if (query) {
      const searchTerm = `%${query}%`;

      dbQuery = dbQuery.where(
        sql`
          ${revenue.month} ILIKE ${searchTerm}
          OR CAST(${revenue.amount} AS text) ILIKE ${searchTerm}
        `
      );
    }

    // 4. Apply ordering and execute
    invoiceData = await dbQuery.orderBy(revenue.month);

  } catch (e) {
    console.error("Failed to fetch filtered invoice data:", e);
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Invoices Management</h1>
      
      <div className="mb-6">
        {/* The SearchComponent handles client-side search interactions */}
        <SearchComponent placeholder="Search invoices by month or amount..." />
      </div>

      {/* Invoices Table (Renders filtered data) */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Invoice List ({invoiceData.length} records)</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID (Short)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoiceData.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id.substring(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${invoice.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.month}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}