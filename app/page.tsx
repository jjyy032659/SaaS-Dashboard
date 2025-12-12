// app/page.tsx

import { db } from "@/lib/db/db"; 
import { revenue, type Revenue } from "@/lib/db/schema"; 
import { RevenueChart } from "./components/RevenueChart"; 
import AddRevenueForm from './ui/AddRevenueForm'; // Component for form
import { addRevenueAction } from "../lib/actions"; // Import the Server Action

// IMPORTANT: This component must be 'async' to fetch data from the server
export default async function DashboardPage() {
  
  // Initialize revenueData to an empty array for robust error handling
  let revenueData: Revenue[] = []; 
  
  try {
    // 1. Fetch the data using Drizzle ORM syntax
    revenueData = await db.select().from(revenue).orderBy(revenue.month);
  } catch (e) {
    // If the database connection fails, log the error and proceed with empty data.
    console.error("Database connection failed. Check your Neon URL, driver setup, or firewalls.", e);
  }
  
  // 2. Calculate key metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const totalRecords = revenueData.length;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* --- Main Content Layout: Grid for KPIs, Form, and Chart --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === COLUMN 1 & 2: KPIs, Raw Data, and Form === */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* KPI Cards Container */}
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
                  <p className="text-3xl font-extrabold">{totalRecords}</p>
                </div>

                {/* Card 3: Raw Data List (for verification) */}
                <div className="p-6 border rounded-xl shadow-md bg-white md:col-span-1">
                  <h2 className="font-semibold text-lg mb-4">Raw Revenue Data</h2>
                  
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {revenueData.map((item) => (
                      <li key={item.id} className="text-sm font-medium flex justify-between">
                        <span>{item.month}</span>
                        <span className="text-blue-600 font-semibold">${item.amount.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>

            {/* 🚀 Server Action Form */}
            {/* The form is passed the Server Action function (addRevenueAction) as a prop */}
            <AddRevenueForm addRevenueAction={addRevenueAction} />
            
        </div>
        
        {/* === COLUMN 3: Chart === */}
        <div className="lg:col-span-1">
            <RevenueChart data={revenueData} />
        </div>
      </div>
    </div>
  );
}