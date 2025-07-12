
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowLeft, Check, Loader2 } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { Booking } from "@/api/entities";

export default function PurchaseFlow({ pass, user, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [selectedDayPasses, setSelectedDayPasses] = useState([]);
  const [selectedOfficeSlots, setSelectedOfficeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const services = pass.services_included || {};
  const maxDate = addDays(new Date(), pass.validity_days);

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= Math.min(30, pass.validity_days); i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  // Generate time slots for office bookings
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  };

  const handleDayPassSelection = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (selectedDayPasses.includes(dateStr)) {
      setSelectedDayPasses(selectedDayPasses.filter(d => d !== dateStr));
    } else if (selectedDayPasses.length < services.day_passes) {
      setSelectedDayPasses([...selectedDayPasses, dateStr]);
    }
  };

  const handleOfficeSlotSelection = (date, timeSlot) => {
    const slotKey = `${format(date, 'yyyy-MM-dd')}_${timeSlot.hour}`;
    const existingSlot = selectedOfficeSlots.find(s => s.key === slotKey);
    
    if (existingSlot) {
      setSelectedOfficeSlots(selectedOfficeSlots.filter(s => s.key !== slotKey));
    } else if (selectedOfficeSlots.length < services.private_office_hours) {
      setSelectedOfficeSlots([...selectedOfficeSlots, {
        key: slotKey,
        date: format(date, 'yyyy-MM-dd'),
        time: timeSlot.time,
        hour: timeSlot.hour,
        label: `${format(date, 'MMM d')} at ${timeSlot.time}`
      }]);
    }
  };

  const handlePurchaseComplete = async () => {
    setLoading(true);
    
    try {
      // Create bookings for selected day passes
      const dayPassBookings = selectedDayPasses.map(dateStr => ({
        user_id: user.id,
        space_type: 'shared_coworking',
        booking_type: 'daily',
        start_date: new Date(`${dateStr}T09:00:00`).toISOString(),
        status: 'confirmed',
        price: 0,
        pass_used: pass.type,
        confirmation_code: Math.random().toString(36).substring(2, 8).toUpperCase()
      }));

      // Create bookings for selected office slots
      const officeBookings = selectedOfficeSlots.map(slot => ({
        user_id: user.id,
        space_type: 'private_office_4',
        booking_type: 'hourly',
        start_date: new Date(`${slot.date}T${slot.time}:00`).toISOString(),
        status: 'confirmed',
        price: 0,
        pass_used: pass.type,
        confirmation_code: Math.random().toString(36).substring(2, 8).toUpperCase()
      }));

      // Create all bookings
      for (const booking of [...dayPassBookings, ...officeBookings]) {
        await Booking.create(booking);
      }

      onComplete({
        pass,
        bookings: [...dayPassBookings, ...officeBookings],
        scheduledDays: selectedDayPasses.length,
        scheduledHours: selectedOfficeSlots.length
      });
    } catch (error) {
      console.error('Error creating bookings:', error);
    }
    
    setLoading(false);
  };

  if (step === 1 && services.day_passes > 0) {
    return (
      <Card className="border-none shadow-xl max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Programá tus días de coworking (Opcional)
              </CardTitle>
              <p className="text-gray-500 mt-1">
                Podés programar hasta {services.day_passes} días ahora, o hacerlo más tarde desde tu dashboard.
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Badge className="bg-blue-100 text-blue-800">
              {selectedDayPasses.length} / {services.day_passes} días seleccionados
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {generateAvailableDates().map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDayPasses.includes(dateStr);
              const canSelect = selectedDayPasses.length < services.day_passes;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDayPassSelection(date)}
                  disabled={!canSelect && !isSelected}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg'
                      : canSelect
                      ? 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      : 'border-2 border-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="font-semibold">{format(date, 'd')}</div>
                  <div className="text-xs">{format(date, 'MMM')}</div>
                  <div className="text-xs">{format(date, 'EEE')}</div>
                </button>
              );
            })}
          </div>
          
          <div className="flex justify-end gap-3">
            {services.private_office_hours > 0 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuar: Seleccionar horas de oficina
              </Button>
            ) : (
              <Button
                onClick={handlePurchaseComplete}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : 'Confirmar compra'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 2 && services.private_office_hours > 0) {
    return (
      <Card className="border-none shadow-xl max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Programá tus horas de oficina (Opcional)
              </CardTitle>
              <p className="text-gray-500 mt-1">
                Podés programar hasta {services.private_office_hours} horas ahora, o hacerlo más tarde.
              </p>
            </div>
            <div className="flex gap-2">
              {services.day_passes > 0 && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              )}
              <Button variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Badge className="bg-green-100 text-green-800">
              {selectedOfficeSlots.length} / {services.private_office_hours} horas seleccionadas
            </Badge>
          </div>
          
          <div className="space-y-6">
            {generateAvailableDates().slice(0, 14).map((date, dateIndex) => (
              <div key={dateIndex} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </h3>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {generateTimeSlots().map((timeSlot, timeIndex) => {
                    const slotKey = `${format(date, 'yyyy-MM-dd')}_${timeSlot.hour}`;
                    const isSelected = selectedOfficeSlots.some(s => s.key === slotKey);
                    const canSelect = selectedOfficeSlots.length < services.private_office_hours;
                    
                    return (
                      <button
                        key={timeIndex}
                        onClick={() => handleOfficeSlotSelection(date, timeSlot)}
                        disabled={!canSelect && !isSelected}
                        className={`p-2 rounded text-sm transition-all ${
                          isSelected
                            ? 'bg-green-600 text-white shadow-md'
                            : canSelect
                            ? 'border border-gray-200 hover:border-green-400 hover:bg-green-50'
                            : 'border border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {timeSlot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {selectedOfficeSlots.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Horas seleccionadas:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedOfficeSlots.map((slot, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {slot.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={handlePurchaseComplete}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : 'Confirmar compra'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no day passes, go straight to office hours
  if (services.private_office_hours > 0 && services.day_passes === 0) {
    return (
      <Card className="border-none shadow-xl max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Programá tus horas de oficina (Opcional)
              </CardTitle>
              <p className="text-gray-500 mt-1">
                Podés programar hasta {services.private_office_hours} horas ahora, o hacerlo más tarde.
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
           <div className="mb-6">
            <Badge className="bg-green-100 text-green-800">
              {selectedOfficeSlots.length} / {services.private_office_hours} horas seleccionadas
            </Badge>
          </div>
          
          <div className="space-y-6">
            {generateAvailableDates().slice(0, 14).map((date, dateIndex) => (
              <div key={dateIndex} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </h3>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {generateTimeSlots().map((timeSlot, timeIndex) => {
                    const slotKey = `${format(date, 'yyyy-MM-dd')}_${timeSlot.hour}`;
                    const isSelected = selectedOfficeSlots.some(s => s.key === slotKey);
                    const canSelect = selectedOfficeSlots.length < services.private_office_hours;
                    
                    return (
                      <button
                        key={timeIndex}
                        onClick={() => handleOfficeSlotSelection(date, timeSlot)}
                        disabled={!canSelect && !isSelected}
                        className={`p-2 rounded text-sm transition-all ${
                          isSelected
                            ? 'bg-green-600 text-white shadow-md'
                            : canSelect
                            ? 'border border-gray-200 hover:border-green-400 hover:bg-green-50'
                            : 'border border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {timeSlot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {selectedOfficeSlots.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Horas seleccionadas:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedOfficeSlots.map((slot, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {slot.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={handlePurchaseComplete}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : 'Confirmar compra'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
