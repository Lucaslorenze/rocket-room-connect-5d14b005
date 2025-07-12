import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Calendar, Clock, Users } from "lucide-react";
import { formatPrice } from "../utils/formatters";

export default function PlanCard({ pass, onPurchase, isPopular = false }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'daypass': return 'bg-blue-100 text-blue-800';
      case 'mini_pass': return 'bg-green-100 text-green-800';
      case 'smart_pass': return 'bg-purple-100 text-purple-800';
      case 'full_pass': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const services = pass.services_included || {};

  return (
    <Card className={`relative border-none shadow-lg hover:shadow-xl transition-all duration-300 ${
      isPopular ? 'ring-2 ring-blue-500 transform scale-105' : ''
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-4 py-1 rounded-full">
            <Star className="w-3 h-3 mr-1" />
            Más Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Badge className={getTypeColor(pass.type)}>
            {pass.name}
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
          {formatPrice(pass.price)}
        </CardTitle>
        <p className="text-gray-500">{pass.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {services.day_passes > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Días de Coworking</span>
              </div>
              <Badge className="bg-blue-600 text-white">
                {services.day_passes}
              </Badge>
            </div>
          )}

          {services.private_office_hours > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Horas de Oficina</span>
              </div>
              <Badge className="bg-orange-600 text-white">
                {services.private_office_hours}h
              </Badge>
            </div>
          )}

          {services.meeting_room_hours > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Sala de Reunión</span>
              </div>
              <Badge className="bg-green-600 text-white">
                {services.meeting_room_hours}h
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">Incluye:</h4>
          <ul className="space-y-1">
            {(pass.features || []).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={() => onPurchase(pass)}
          className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          Comprar Plan
        </Button>
      </CardContent>
    </Card>
  );
}