import Link from "next/link";
import { LayoutDashboard, BarChart3, Settings, User } from "lucide-react";

// 1. The Data (Configuration)
const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Invoices", // <--- ADDED INVOICES LINK
    icon: User, // Using the User icon for client/invoicing
    href: "/invoices", // Points to the page you created
    color: "text-green-500", // Giving it a distinct color
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-violet-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-pink-700",
  },
];

export default function Sidebar() {
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white w-64">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">SaaS App</h1>
        </Link>
        
        <div className="space-y-1">
          {/* YOUR TASK: Map over the 'routes' array here */}
          {routes.map((route) => (
            <Link
              key={route.href} 
              href={route.href}
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <div className="flex items-center flex-1">
               {/* 1. The Icon (Self-closing tag with styling) */}
    <route.icon className={`h-5 w-5 mr-3 ${route.color}`} />
    
    {/* 2. The Label (Next to the icon) */}
    {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}