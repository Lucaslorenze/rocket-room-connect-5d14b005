import React, { useState, useEffect } from "react";
import { Pass } from "@/api/entities";
import { User } from "@/api/entities";
import { Payment } from "@/api/entities";
import PlanCard from "../components/plans/PlanCard";
import PurchaseFlow from "../components/plans/PurchaseFlow";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Plans() {
  const [passes, setPasses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [passesData, userData] = await Promise.all([
        Pass.filter({ is_active: true }),
        User.me()
      ]);
      setPasses(passesData);
      setUser(userData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
    setLoading(false);
  };

  const handlePurchase = async (pass) => {
    setSelectedPass(pass);
  };

  const handlePurchaseComplete = async (purchaseData) => {
    setProcessing(true);
    setMessage(null);

    try {
      // Crear registro de pago
      const payment = await Payment.create({
        user_id: user.id,
        amount: purchaseData.pass.price,
        pass_type: purchaseData.pass.type,
        status: 'completed'
      });

      // Calcular servicios restantes (restar lo que se programó)
      const remainingServices = {
        day_passes: Math.max(0, (purchaseData.pass.services_included?.day_passes || 0) - purchaseData.scheduledDays),
        private_office_hours: Math.max(0, (purchaseData.pass.services_included?.private_office_hours || 0) - purchaseData.scheduledHours),
        meeting_room_hours: purchaseData.pass.services_included?.meeting_room_hours || 0
      };

      // Agregar a pases activos solo si quedan servicios
      const updatedActivePasses = [...(user.active_passes || [])];
      if (remainingServices.day_passes > 0 || remainingServices.private_office_hours > 0 || remainingServices.meeting_room_hours > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + purchaseData.pass.validity_days);

        updatedActivePasses.push({
          type: purchaseData.pass.type,
          services_remaining: remainingServices,
          expires_at: expiryDate.toISOString().split('T')[0]
        });
      }

      const updatedTotalSpent = (user.total_spent || 0) + purchaseData.pass.price;

      await User.updateMyUserData({
        active_passes: updatedActivePasses,
        total_spent: updatedTotalSpent
      });

      // Recargar datos del usuario
      const updatedUser = await User.me();
      setUser(updatedUser);

      setMessage({
        type: 'success',
        text: `¡${purchaseData.pass.name} comprado exitosamente! Se programaron ${purchaseData.scheduledDays} días y ${purchaseData.scheduledHours} horas de oficina.`
      });
      
      setSelectedPass(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al comprar el plan. Por favor intentá de nuevo.'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPass) {
    return (
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <PurchaseFlow
          pass={selectedPass}
          user={user}
          onComplete={handlePurchaseComplete}
          onCancel={() => setSelectedPass(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Elegí tu plan perfecto
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accedé a espacios de coworking premium en Rocket Room. 
              Elegí el plan que se adapte a tus necesidades de productividad.
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <Link to={createPageUrl("ManagePlans")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Gestionar Planes
              </Button>
            </Link>
          )}
        </div>

        {message && (
          <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 h-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {passes.map((pass, index) => (
            <PlanCard
              key={pass.id}
              pass={pass}
              onPurchase={handlePurchase}
              isPopular={pass.type === 'smart_pass'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}