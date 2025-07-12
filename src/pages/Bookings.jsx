
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Booking } from "@/api/entities";
import { Space } from "@/api/entities"; // Added Space entity import
import SpaceCard from "../components/bookings/SpaceCard";
import BookingForm from "../components/bookings/BookingForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Bookings() {
  const [user, setUser] = useState(null);
  const [spaces, setSpaces] = useState([]); // Changed to state for dynamic loading
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadInitialData(); // Call new data loading function
  }, []);

  // New function to load both user and space data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [userData, spacesData] = await Promise.all([
        User.me(),
        Space.list({ is_active: true }) // Fetch active spaces from the backend
      ]);
      setUser(userData);
      setSpaces(spacesData);
    } catch (error) {
      console.error("Error loading initial data:", error);
      // Optionally set an error message for the user
      setMessage({
        type: 'error',
        text: 'Error al cargar los datos iniciales. Por favor, intentá de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpace = (space) => {
    setSelectedSpace(space);
  };

  const handleBookingSubmit = async (bookingData) => {
    setProcessing(true);
    setMessage(null);

    try {
      // Generate confirmation code
      const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create booking
      const booking = await Booking.create({
        ...bookingData,
        user_id: user.id,
        status: 'confirmed',
        confirmation_code: confirmationCode
      });

      // If using a pass, update user's passes
      if (bookingData.pass_used) {
        const updatedPasses = user.active_passes.map(pass => {
          if (pass.type === bookingData.pass_used) {
            const updatedServices = { ...pass.services_remaining };
            
            if (bookingData.space_type === 'shared_coworking') {
              updatedServices.day_passes = Math.max(0, updatedServices.day_passes - 1);
            } else {
              updatedServices.private_office_hours = Math.max(0, updatedServices.private_office_hours - 1);
            }
            
            return {
              ...pass,
              services_remaining: updatedServices
            };
          }
          return pass;
        });

        await User.updateMyUserData({
          active_passes: updatedPasses
        });

        // Reload user data
        const updatedUser = await User.me();
        setUser(updatedUser);
      }

      setMessage({
        type: 'success',
        text: `¡Reserva confirmada! Tu código de confirmación es: ${confirmationCode}`
      });
      
      setSelectedSpace(null);
    } catch (error) {
      console.error("Booking submission error:", error);
      setMessage({
        type: 'error',
        text: 'Error al crear la reserva. Por favor intentá de nuevo.'
      });
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Reservá tu Espacio Perfecto
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Elegí entre nuestros espacios de coworking premium diseñados para la productividad y colaboración.
          </p>
        </div>

        {message && (
          <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {selectedSpace ? (
          <div className="max-w-2xl mx-auto">
            <BookingForm
              space={selectedSpace}
              onSubmit={handleBookingSubmit}
              onCancel={() => setSelectedSpace(null)}
              userPasses={user?.active_passes || []}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onBook={handleBookSpace}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
