// app/customers/loading.tsx

// A simple utility component for a placeholder line
const SkeletonLine = ({ height = 'h-5', width = 'w-full' }) => (
    <div className={`bg-gray-200 rounded ${height} ${width}`}></div>
);

// The main loading component for the customers page
export default function CustomersLoading() {
  const items = Array.from({ length: 5 }); // Simulate 5 rows

  return (
    <div className="p-6 max-w-5xl">
      
      {/* Header and Search Skeleton */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <SkeletonLine height="h-8" width="w-64" />
          <SkeletonLine height="h-4" width="w-96 mt-2" />
        </div>
        <div className="w-72">
           <SkeletonLine height="h-10" width="w-72" />
        </div>
      </div>
      
      {/* Customer Growth Chart Skeleton */}
      <div className="bg-white p-6 rounded-xl shadow-md border h-96 mb-10 animate-pulse">
          <SkeletonLine height="h-6" width="w-48" />
          <div className="mt-8 bg-gray-100 h-72">
              {/* This large block simulates the chart drawing */}
          </div>
      </div>

      {/* Add Customer Form Skeleton */}
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 animate-pulse flex gap-4">
          <SkeletonLine height="h-10" width="w-full" />
          <SkeletonLine height="h-10" width="w-full" />
          <SkeletonLine height="h-10" width="w-24" />
      </div>

      {/* Customers Table Skeleton */}
      <div className="bg-white shadow-sm rounded-xl border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 animate-pulse">
            {items.map((_, index) => (
              <tr key={index} className="h-14">
                <td className="px-6 py-4">
                    <SkeletonLine height="h-4" width="w-32" />
                </td>
                <td className="px-6 py-4">
                    <SkeletonLine height="h-4" width="w-48" />
                </td>
                <td className="px-6 py-4 text-right">
                    <SkeletonLine height="h-6" width="w-6" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}