
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Booking } from "@/api/entities";
import { Payment } from "@/api/entities";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import StatsGrid from "../components/dashboard/StatsGrid";
import QuickActions from "../components/dashboard/QuickActions";
import BookingCalendar from "../components/dashboard/BookingCalendar";
import ActivePasses from "../components/plans/ActivePasses";
import UpcomingBookings from "../components/dashboard/UpcomingBookings"; // New import

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const userBookings = await Booking.filter({ user_id: userData.id }, '-created_date', 20);
      setBookings(userBookings);

      const userPayments = await Payment.filter({ user_id: userData.id });
      const totalSpent = userPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      const activeBookings = userBookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'pending'
      ).length;

      const availablePasses = userData.active_passes?.reduce((sum, pass) => 
        (pass.services_remaining?.day_passes || 0) + 
        (pass.services_remaining?.private_office_hours || 0) + 
        (pass.services_remaining?.meeting_room_hours || 0), 0
      ) || 0;

      setStats({
        activeBookings,
        availablePasses,
        spacesBooked: userBookings.length,
        totalSpent
      });
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
        <WelcomeCard user={user} />
        
        <StatsGrid stats={stats} />
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8"> {/* Added space-y-8 */}
            <BookingCalendar bookings={bookings} />
            <UpcomingBookings bookings={bookings} /> {/* New component */}
          </div>
          <div className="space-y-6">
            <ActivePasses user={user} />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
