import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function BookingCalendar({ bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDay = (date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.start_date), date) && 
      (booking.status === 'confirmed' || booking.status === 'pending')
    );
  };

  const getBookingDots = (dayBookings) => {
    const dots = [];
    const spaceTypes = {
      'shared_coworking': '#0055FF', // Azul
      'private_office_4': '#FF4800', // Naranja
      'private_office_6': '#22C55E'  // Verde
    };

    dayBookings.forEach((booking, index) => {
      if (index < 3) { // Máximo 3 puntos por día
        dots.push(
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: spaceTypes[booking.space_type] || '#6B7280' }}
          />
        );
      }
    });

    return dots;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Mis Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tenés reservas aún</p>
            <p className="text-sm text-gray-400 mt-1">¡Reservá tu primer espacio para comenzar!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">Mis Reservas</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[120px] text-center">
              <span className="font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-2">{day}</div>
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, dayIndex) => {
              const dayBookings = getBookingsForDay(day);
              const isToday = isSameDay(day, new Date());
              const hasBookings = dayBookings.length > 0;
              
              return (
                <div
                  key={dayIndex}
                  className={`p-2 h-12 flex flex-col items-center justify-center relative rounded-lg transition-colors ${
                    isToday 
                      ? 'bg-blue-600 text-white font-bold' 
                      : hasBookings 
                      ? 'bg-blue-50 text-blue-900 font-medium hover:bg-blue-100' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">
                    {format(day, 'd')}
                  </span>
                  
                  {hasBookings && (
                    <div className="flex gap-0.5 mt-0.5">
                      {getBookingDots(dayBookings)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Leyenda */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span>Coworking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>Oficina 4p</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Oficina 6p</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}