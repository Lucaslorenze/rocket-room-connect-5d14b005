
import React, { useState, useEffect } from "react";
import { Booking } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, CreditCard, X, Loader2, Users, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function BookingForm({ space, onSubmit, onCancel, userPasses }) {
  const [formData, setFormData] = useState({
    booking_type: space.type === 'shared_coworking' ? 'daily' : 'hourly',
    start_date: '',
    start_time: '',
    duration_hours: 1,
    pass_used: '',
    notes: '',
    guests: []
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availability, setAvailability] = useState({ available: true, count: 0 });

  useEffect(() => {
    // Reset time slots and availability when date or duration changes
    setTimeSlots([]);
    setAvailability({ available: true, count: 0 });
    
    if (formData.start_date) {
      if (space.type === 'shared_coworking') {
        checkSharedSpaceAvailability();
      } else if (formData.booking_type === 'hourly') {
        fetchAvailableSlots();
      }
    }
  }, [formData.start_date, space.type, formData.booking_type, formData.duration_hours]);

  const checkSharedSpaceAvailability = async () => {
    setLoadingSlots(true);
    const selectedDate = new Date(formData.start_date);
    try {
      const allBookings = await Booking.list();
      const bookingsForDay = allBookings.filter(b => {
        const bookingDate = new Date(b.start_date);
        return bookingDate.toDateString() === selectedDate.toDateString() && b.space_type === 'shared_coworking';
      });
      const bookingsCount = bookingsForDay.length;
      setAvailability({
        available: bookingsCount < space.capacity,
        count: bookingsCount
      });
    } catch (error) {
      console.error("Error checking shared space availability:", error);
    }
    setLoadingSlots(false);
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    const selectedDate = new Date(formData.start_date);

    try {
      // Fetch all bookings for this specific space type and date
      const allBookings = await Booking.list();
      
      // Filter bookings for the selected day and space type
      const bookingsForDay = allBookings.filter(b => {
        const bookingDate = new Date(b.start_date);
        return bookingDate.toDateString() === selectedDate.toDateString() && 
               b.space_type === space.type && // Filter by specific space type
               (b.status === 'confirmed' || b.status === 'pending');
      });

      // Generate available time intervals based on duration
      const slots = generateTimeIntervals(bookingsForDay, formData.duration_hours);
      setTimeSlots(slots);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
    setLoadingSlots(false);
  };

  const generateTimeIntervals = (bookingsForDay, duration) => {
    const slots = [];
    const startHour = 8;
    const endHour = 20; // Represents 8 PM (exclusive)
    
    // Create detailed array of all booked time slots
    const bookedTimeSlots = new Set();
    
    bookingsForDay.forEach(booking => {
      if (booking.booking_type === 'daily') {
        // Daily bookings block the entire operating day
        for (let hour = startHour; hour < endHour; hour++) {
          bookedTimeSlots.add(hour);
        }
      } else { // Hourly booking
        const bookingStart = new Date(booking.start_date);
        const bookingHour = bookingStart.getHours();
        const bookingDuration = booking.duration_hours || 1;
        
        // Mark all hours within this booking as occupied
        for (let i = 0; i < bookingDuration; i++) {
          bookedTimeSlots.add(bookingHour + i);
        }
      }
    });

    // Generate available intervals for the requested duration
    for (let hour = startHour; hour <= endHour - duration; hour++) {
      let isIntervalAvailable = true;
      
      // Check if ALL hours in this interval are available
      for (let i = 0; i < duration; i++) {
        if (bookedTimeSlots.has(hour + i)) {
          isIntervalAvailable = false;
          break;
        }
      }

      if (isIntervalAvailable) {
        const endTime = hour + duration;
        slots.push({
          startHour: hour,
          endHour: endTime,
          timeString: `${hour.toString().padStart(2, '0')}:00`,
          label: `${hour.toString().padStart(2, '0')}:00 - ${endTime.toString().padStart(2, '0')}:00`,
          isAvailable: true
        });
      }
    }

    return slots;
  };

  const getAvailablePassesForSpace = () => {
    if (!userPasses) return [];

    return userPasses.filter(pass => {
      const services = pass.services_remaining || {};

      if (space.type === 'shared_coworking') {
        return services.day_passes > 0;
      } else {
        return services.private_office_hours >= formData.duration_hours;
      }
    });
  };

  const availablePasses = getAvailablePassesForSpace();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Combine date and time
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time || '09:00'}`);

    onSubmit({
      ...formData,
      start_date: startDateTime.toISOString(),
      space_type: space.type,
      price: calculatePrice()
    });
  };

  const calculatePrice = () => {
    if (formData.pass_used) {
      return 0;
    }

    switch (formData.booking_type) {
      case 'hourly':
        return (space.hourly_price || space.price) * formData.duration_hours;
      case 'daily':
        return space.daily_price || space.price;
      case 'monthly':
        return (space.daily_price || space.price) * 20;
      default:
        return 0;
    }
  };

  const addGuest = () => {
    setFormData({
      ...formData,
      guests: [...formData.guests, { name: '', email: '', is_external: false }]
    });
  };

  const updateGuest = (index, field, value) => {
    const newGuests = [...formData.guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setFormData({ ...formData, guests: newGuests });
  };

  const removeGuest = (index) => {
    setFormData({
      ...formData,
      guests: formData.guests.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reservar {space.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {space.type !== 'shared_coworking' ? (
              <div>
                <Label htmlFor="booking_type">Tipo de Reserva</Label>
                <Select value={formData.booking_type} onValueChange={(value) => setFormData({ ...formData, booking_type: value, start_time: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Por Hora</SelectItem>
                    <SelectItem value="daily">Día Completo</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center font-medium">
                Tipo de Reserva: Día Completo
              </div>
            )}

            <div>
              <Label htmlFor="pass_used">Usar Pase (Opcional)</Label>
              <Select value={formData.pass_used} onValueChange={(value) => setFormData({ ...formData, pass_used: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar pase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sin pase</SelectItem>
                  {availablePasses.map((pass, index) => (
                    <SelectItem key={index} value={pass.type}>
                      {pass.type.replace('_', ' ')} ({
                        space.type === 'shared_coworking'
                          ? `${pass.services_remaining.day_passes} días`
                          : `${pass.services_remaining.private_office_hours} horas`
                      } restantes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration selector for hourly bookings */}
          {space.type !== 'shared_coworking' && formData.booking_type === 'hourly' && (
            <div>
              <Label htmlFor="duration_hours">Duración (horas)</Label>
              <Select value={formData.duration_hours.toString()} onValueChange={(value) => setFormData({ ...formData, duration_hours: parseInt(value), start_time: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="3">3 horas</SelectItem>
                  <SelectItem value="4">4 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="start_date">Seleccionar Fecha</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value, start_time: '' })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {space.type === 'shared_coworking' && formData.start_date && (
            <div className="text-center p-2 bg-gray-100 rounded-lg">
              {loadingSlots ? (
                <p>Verificando disponibilidad...</p>
              ) : availability.available ? (
                <p className="text-green-600 font-medium">
                  ¡Quedan {space.capacity - availability.count} lugares disponibles!
                </p>
              ) : (
                <p className="text-red-600 font-medium">
                  No quedan lugares disponibles para esta fecha.
                </p>
              )}
            </div>
          )}

          {/* Time slot selection for hourly bookings */}
          {space.type !== 'shared_coworking' && formData.booking_type === 'hourly' && formData.start_date && (
            <div>
              <Label htmlFor="start_time">Seleccionar Horario</Label>
              {loadingSlots ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {timeSlots.length > 0 ? (
                    timeSlots.map((slot, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={formData.start_time === slot.timeString ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, start_time: slot.timeString })}
                        className={`transition-all ${
                          formData.start_time === slot.timeString ? 'bg-blue-600' : ''
                        }`}
                      >
                        {slot.label}
                      </Button>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500">No hay horarios disponibles para esta fecha/duración.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Guest management for office bookings */}
          {space.type !== 'shared_coworking' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Invitados (Opcional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addGuest}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Invitado
                </Button>
              </div>
              
              {formData.guests.map((guest, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Invitado {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGuest(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Nombre completo"
                      value={guest.name}
                      onChange={(e) => updateGuest(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={guest.email}
                      onChange={(e) => updateGuest(index, 'email', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`guest-type-${index}`}
                        checked={!guest.is_external}
                        onChange={() => updateGuest(index, 'is_external', false)}
                      />
                      <span className="text-sm">Coworker</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`guest-type-${index}`}
                        checked={guest.is_external}
                        onChange={() => updateGuest(index, 'is_external', true)}
                      />
                      <span className="text-sm">Visitante Externo</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Requisitos especiales o notas adicionales..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-24"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Precio Total:</span>
              <span className="text-2xl font-bold text-blue-600">${calculatePrice()}</span>
            </div>
            {formData.pass_used && (
              <p className="text-sm text-green-600 mt-2">
                Usando {formData.pass_used.replace('_', ' ')} - Esta reserva utilizará {
                  space.type === 'shared_coworking' ? '1 día' : `${formData.duration_hours} horas`
                }
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={space.type === 'shared_coworking' && !availability.available}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Reservar Ahora
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
