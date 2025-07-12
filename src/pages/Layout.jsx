

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  Calendar, 
  CreditCard, 
  User, 
  Settings, 
  BarChart3,
  Users,
  MapPin,
  Building2 // Added Building2 icon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User as UserEntity } from "@/api/entities";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
    role: "all"
  },
  {
    title: "Book Space",
    url: createPageUrl("Bookings"),
    icon: Calendar,
    role: "all"
  },
  {
    title: "Plans & Passes",
    url: createPageUrl("Plans"),
    icon: CreditCard,
    role: "all"
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
    role: "all"
  },
  {
    title: "Admin Panel",
    url: createPageUrl("Admin"),
    icon: BarChart3,
    role: "admin"
  },
  {
    title: "Manage Plans",
    url: createPageUrl("ManagePlans"),
    icon: Settings,
    role: "admin"
  },
  { // New navigation item for Manage Spaces
    title: "Manage Spaces",
    url: createPageUrl("ManageSpaces"),
    icon: Building2,
    role: "admin"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    }
    setLoading(false);
  };

  const filteredNavItems = navigationItems.filter(item => 
    item.role === "all" || (user && user.role === item.role)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            :root {
              --primary: #0055FF;
              --secondary: #E6E6E6;
              --accent: #FF4800;
              --text-primary: #1A1A1A;
              --text-secondary: #6B7280;
              --bg-primary: #FFFFFF;
              --bg-secondary: #F9FAFB;
            }
            
            * {
              font-family: 'Poppins', sans-serif;
            }
            
            body {
              background-color: var(--bg-secondary);
            }
          `}
        </style>
        
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                   style={{ backgroundColor: 'var(--primary)' }}>
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Rocket Room</h2>
                <p className="text-xs text-gray-500 font-medium">Olivos, Buenos Aires</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {filteredNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-200 rounded-lg font-medium ${
                          location.pathname === item.url 
                            ? 'text-white shadow-lg' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        style={location.pathname === item.url ? 
                          { backgroundColor: 'var(--primary)' } : {}}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4">
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
                     style={{ backgroundColor: 'var(--primary)' }}>
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.role === 'admin' ? 'Administrator' : 'Client'}
                  </p>
                </div>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-gray-900">Rocket Room</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

