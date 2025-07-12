import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function UpcomingBookings({ bookings }) {
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
      case 'shared_coworking': return 'Coworking Compartido';
      case 'private_office_4': return 'Oficina Privada (4 personas)';
      case 'private_office_6': return 'Oficina Privada (6 personas)';
      default: return type;
    }
  };

  const getSpaceIcon = (type) => {
    switch (type) {
      case 'shared_coworking': return Users;
      case 'private_office_4': return MapPin;
      case 'private_office_6': return MapPin;
      default: return MapPin;
    }
  };

  const getSpaceColor = (type) => {
    switch (type) {
      case 'shared_coworking': return 'text-blue-600 bg-blue-50';
      case 'private_office_4': return 'text-orange-600 bg-orange-50';
      case 'private_office_6': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Filter for upcoming bookings (today and future)
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.start_date);
    const today = new Date();
    return (isAfter(bookingDate, today) || isSameDay(bookingDate, today)) && 
           (booking.status === 'confirmed' || booking.status === 'pending');
  }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  if (!upcomingBookings || upcomingBookings.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Próximas Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tenés reservas próximas</p>
            <p className="text-sm text-gray-400 mt-1">¡Reservá tu próximo espacio de trabajo!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Próximas Reservas ({upcomingBookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingBookings.map((booking) => {
          const SpaceIcon = getSpaceIcon(booking.space_type);
          const spaceColor = getSpaceColor(booking.space_type);
          
          return (
            <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${spaceColor}`}>
                <SpaceIcon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {getSpaceTypeLabel(booking.space_type)}
                  </h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(booking.start_date), 'EEEE, d \'de\' MMMM', { locale: es })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(booking.start_date), 'HH:mm')}
                    {booking.duration_hours && booking.duration_hours > 1 && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {booking.duration_hours}h
                      </span>
                    )}
                  </span>
                </div>
                
                {booking.guests && booking.guests.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {booking.guests.length} invitado{booking.guests.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {booking.confirmation_code && (
                  <div className="text-xs text-gray-400 mt-1">
                    Código: {booking.confirmation_code}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {booking.price > 0 ? `$${booking.price}` : 'Gratis'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {booking.booking_type === 'hourly' ? 'Por hora' : 
                   booking.booking_type === 'daily' ? 'Día completo' : 'Mensual'}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}