import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Calendar, Clock, CreditCard, Users } from "lucide-react";

export default function ActivePasses({ user }) {
  const activePasses = user?.active_passes || [];

  const getTypeColor = (type) => {
    switch (type) {
      case 'daypass': return 'bg-blue-100 text-blue-800';
      case 'mini_pass': return 'bg-green-100 text-green-800';
      case 'smart_pass': return 'bg-purple-100 text-purple-800';
      case 'full_pass': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPassName = (type) => {
    switch (type) {
      case 'daypass': return 'Day Pass';
      case 'mini_pass': return 'Mini Pass';
      case 'smart_pass': return 'Smart Pass';
      case 'full_pass': return 'Full Pass';
      default: return type;
    }
  };

  if (activePasses.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Active Passes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active passes</p>
            <p className="text-sm text-gray-400 mt-1">Purchase a pass to start booking spaces!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Active Passes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activePasses.map((pass, index) => {
          const services = pass.services_remaining || {};
          
          return (
            <div key={index} className="p-4 rounded-xl border border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{getPassName(pass.type)}</h3>
                    <Badge className={getTypeColor(pass.type)}>
                      {pass.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(pass.expires_at), 'MMM d')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {services.day_passes > 0 && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Day Passes</span>
                    </div>
                    <span className="font-bold text-blue-600">{services.day_passes}</span>
                  </div>
                )}
                
                {services.private_office_hours > 0 && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Office Hours</span>
                    </div>
                    <span className="font-bold text-green-600">{services.private_office_hours}h</span>
                  </div>
                )}
                
                {services.meeting_room_hours > 0 && (
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Meeting Room</span>
                    </div>
                    <span className="font-bold text-purple-600">{services.meeting_room_hours}h</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}