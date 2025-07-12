import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function RecentBookings({ bookings }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpaceTypeLabel = (type) => {
    switch (type) {
      case 'shared_coworking': return 'Shared Space';
      case 'private_office_4': return 'Private Office (4 people)';
      case 'private_office_6': return 'Private Office (6 people)';
      default: return type;
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bookings yet</p>
            <p className="text-sm text-gray-400 mt-1">Book your first space to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{getSpaceTypeLabel(booking.space_type)}</h3>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(booking.start_date), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(booking.start_date), 'h:mm a')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${booking.price}</p>
              <p className="text-sm text-gray-500">{booking.booking_type}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}