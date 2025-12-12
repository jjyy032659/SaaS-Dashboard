// app/ui/search.tsx
'use client';

import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; // You will need to install this

// Install this package for professional debounce handling:
// npm install use-debounce

export default function SearchComponent({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();//This hook reads the current query parameters from the URL (e.g., in ?page=5&query=test, it gets page=5 and query=test).
  const pathname = usePathname();//This hook retrieves the current path of the URL (e.g., /search).
  const { replace } = useRouter();

  // Debounce prevents hitting the database on every keypress (100ms delay)
  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    //The line const params = new URLSearchParams(searchParams) uses this read-only object to create a new, editable instance of the standard URLSearchParams Web API object.
    //When the URL is /invoices?page=1&query=1034, the searchParams variable holds a read-only representation of those parameters: page:1, query:1034.
    

    // Always reset the page number to 1 when a new search query is initiated
    params.set('page', '1'); 

    if (term) {
      // Add the search term to the URL query parameters
      params.set('query', term);
    } else {
      // Remove the query if the search term is empty
      params.delete('query');
    }

    // Update the URL without reloading the entire page
    replace(`${pathname}?${params.toString()}`); // Update the URL without reloading the entire page
  }, 300); // Wait 300ms after the user stops typing

  return (
    <div className="relative flex flex-1 flex-shrink-0"> 
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        // Set the default value to the current query in the URL
        defaultValue={searchParams.get('query') || ''}
      />
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}