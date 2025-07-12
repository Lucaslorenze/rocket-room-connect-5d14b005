import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users } from "lucide-react";

export default function WelcomeCard({ user }) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {greeting}, {user?.full_name || 'Welcome'}! 👋
            </h1>
            <p className="text-blue-100 text-lg mb-4">
              Ready to be productive at Rocket Room today?
            </p>
            <div className="flex items-center gap-2 text-blue-100">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Olivos, Buenos Aires</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Open: 8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Available Spaces</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}