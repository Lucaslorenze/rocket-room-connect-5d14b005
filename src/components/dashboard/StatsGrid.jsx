import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, MapPin, TrendingUp } from "lucide-react";

export default function StatsGrid({ stats }) {
  const statCards = [
    {
      title: "Active Bookings",
      value: stats.activeBookings || 0,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Available Passes",
      value: stats.availablePasses || 0,
      icon: CreditCard,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Spaces Booked",
      value: stats.spacesBooked || 0,
      icon: MapPin,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent || 0}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}