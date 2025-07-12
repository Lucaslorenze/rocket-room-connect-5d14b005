import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      title: "Book a Space",
      description: "Reserve your spot for today",
      icon: Calendar,
      href: createPageUrl("Bookings"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Buy a Pass",
      description: "Get access to coworking spaces",
      icon: CreditCard,
      href: createPageUrl("Plans"),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Update Profile",
      description: "Manage your account settings",
      icon: User,
      href: createPageUrl("Profile"),
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <Link key={index} to={action.href} className="block">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer">
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}