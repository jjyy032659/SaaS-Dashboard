// app/page.tsx

// 1. Import the new Drizzle DB client
import { db } from "@/lib/db/db"; 

// 2. Import the Drizzle schema (table definition) and the TypeScript type
import { revenue, type Revenue } from "@/lib/db/schema"; 

// 3. Import the chart component using the corrected relative path
import { RevenueChart } from "./components/RevenueChart"; 

// IMPORTANT: This component must be 'async' to fetch data from the server
export default async function DashboardPage() {
  
  // Initialize revenueData to an empty array for robust error handling
  let revenueData: Revenue[] = []; 
  
  try {
    // 4. Fetch the data using Drizzle ORM syntax
    revenueData = await db.select().from(revenue).orderBy(revenue.month);
  } catch (e) {
    // If the database connection fails, log the error and proceed with empty data.
    console.error("Database connection failed. Check your Neon URL, driver setup, or firewalls.", e);
  }
  
  // 5. Calculate a simple total for display
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* Container for key metrics (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Revenue (KPI) */}
        <div className="p-6 border rounded-xl shadow-md bg-white">
          <h2 className="font-semibold text-lg mb-2 text-gray-500">Total Revenue</h2>
          <p className="text-3xl font-extrabold text-green-600">
            ${totalRevenue.toLocaleString()} 
          </p>
        </div>

        {/* Card 2: Total Records */}
        <div className="p-6 border rounded-xl shadow-md bg-white">
          <h2 className="font-semibold text-lg mb-2 text-gray-500">Data Points</h2>
          <p className="text-3xl font-extrabold">{revenueData.length}</p>
        </div>

        {/* Card 3: Raw Data List (for verification) */}
        <div className="p-6 border rounded-xl shadow-md bg-white md:col-span-1">
          <h2 className="font-semibold text-lg mb-4">Raw Revenue Data</h2>
          
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {revenueData.map((item) => (
              // Using item.id as the key, assuming your Drizzle schema exports the UUID as a string
              <li key={item.id} className="text-sm font-medium flex justify-between">
                <span>{item.month}</span>
                <span className="text-blue-600 font-semibold">${item.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. INTEGRATE THE REVENUE CHART */}
      {/* The component is a Client Component, but the data is passed from this Server Component */}
      <RevenueChart data={revenueData} />
    </div>
  );
}