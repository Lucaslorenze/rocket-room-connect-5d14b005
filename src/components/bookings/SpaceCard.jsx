import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Wifi, Coffee, Printer, Phone, Monitor, Square } from "lucide-react";
import { formatPrice } from "../utils/formatters";

export default function SpaceCard({ space, onBook }) {
  const getSpaceIcon = (type) => {
    switch (type) {
      case 'shared_coworking': return Users;
      case 'private_office_4': return MapPin;
      case 'private_office_6': return MapPin;
      default: return Users;
    }
  };

  const getFeatureIcon = (feature) => {
    const iconMap = {
      'WiFi': Wifi,
      'Coffee': Coffee,
      'Printing': Printer,
      'Phone Booth': Phone,
      'Meeting Rooms': Users,
      'Monitors': Monitor,
      'Whiteboard': Square,
      'Privacy': Square,
      'Conference Table': Square
    };
    return iconMap[feature] || Users;
  };

  const SpaceIcon = getSpaceIcon(space.type);

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <SpaceIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {space.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {space.capacity} {space.capacity === 1 ? 'persona' : 'personas'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          {space.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {(space.features || []).slice(0, 4).map((feature, index) => {
            const FeatureIcon = getFeatureIcon(feature);
            return (
              <div key={index} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                <FeatureIcon className="w-3 h-3" />
                {feature}
              </div>
            );
          })}
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          {space.type === 'shared_coworking' ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(space.daily_price)}
              </div>
              <div className="text-sm text-gray-500">por día completo</div>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(space.hourly_price)}
              </div>
              <div className="text-sm text-gray-500">por hora</div>
              <div className="text-lg font-semibold text-gray-700">
                Día completo {formatPrice(space.daily_price)}
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={() => onBook(space)}
          className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          Reservar Espacio
        </Button>
      </CardContent>
    </Card>
  );
}