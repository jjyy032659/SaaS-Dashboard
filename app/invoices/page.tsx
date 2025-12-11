// app/invoices/page.tsx
// app/invoices/page.tsx
import { db } from "@/lib/db/db"; 
import { revenue } from "@/lib/db/schema"; // TEMP: Using revenue table data
import { Search } from 'lucide-react'; // Icon for search bar

// Define the type to be used on this page (Invoices)
type Invoice = {
  id: string;
  amount: number;
  month: string;
  createdAt: Date;
};


// This component will eventually accept a search query as a prop
export default async function InvoicesPage() {
  let invoiceData: Invoice[] = [];

  try {
    // Fetch data (Temporarily using revenue table as proxy for 'invoices' table)
    invoiceData = await db.select().from(revenue).orderBy(revenue.month);
  } catch (e) {
    console.error("Failed to fetch invoice data:", e);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Invoices Management</h1>

      {/* Search Component Placeholder (Next Step) */}
      <div className="relative mb-6">
         <input
            type="text"
            placeholder="Search invoices..."
            className="w-full p-2 border border-gray-300 rounded-lg pl-10"
         />
         <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
      </div>

      {/* Invoices Table */}
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