import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, User, Users, Mail, Phone } from "lucide-react";
import { Booking } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function BookingSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState(''); // 'email' or 'code'

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setSearchResults(null);
    setSearchType('');

    try {
      // First, try to search by confirmation code
      const allBookings = await Booking.list();
      const bookingByCode = allBookings.find(b => 
        b.confirmation_code && 
        b.confirmation_code.toLowerCase() === searchTerm.toLowerCase()
      );

      if (bookingByCode) {
        // Found by confirmation code
        const user = await UserEntity.list();
        const bookingUser = user.find(u => u.id === bookingByCode.user_id);
        
        setSearchResults({
          type: 'booking',
          booking: bookingByCode,
          user: bookingUser
        });
        setSearchType('code');
      } else {
        // Search by email
        const users = await UserEntity.list();
        const userByEmail = users.find(u => 
          u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (userByEmail) {
          const userBookings = allBookings.filter(b => b.user_id === userByEmail.id);
          
          setSearchResults({
            type: 'user',
            user: userByEmail,
            bookings: userBookings.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
          });
          setSearchType('email');
        } else {
          setSearchResults({
            type: 'none',
            message: 'No se encontraron resultados para la búsqueda'
          });
        }
      }
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults({
        type: 'error',
        message: 'Error al realizar la búsqueda'
      });
    }
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Buscar Reservas
        </CardTitle>
        <p className="text-gray-600">
          Busca por código de confirmación o email del cliente
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Ingresa código de confirmación o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        {searchResults && (
          <div className="space-y-4">
            {searchResults.type === 'booking' && (
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reserva Encontrada
                  </h3>
                  <Badge className={getStatusColor(searchResults.booking.status)}>
                    {getStatusLabel(searchResults.booking.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Detalles de la Reserva</h4>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{format(new Date(searchResults.booking.start_date), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {format(new Date(searchResults.booking.start_date), 'HH:mm')}
                        {searchResults.booking.duration_hours && searchResults.booking.duration_hours > 1 && (
                          <span className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                            {searchResults.booking.duration_hours} horas
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Espacio:</span> {getSpaceTypeLabel(searchResults.booking.space_type)}
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Precio:</span> ${searchResults.booking.price}
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Código:</span> {searchResults.booking.confirmation_code}
                    </div>
                    
                    {searchResults.booking.pass_used && (
                      <div className="text-sm">
                        <span className="font-medium">Pase utilizado:</span> {searchResults.booking.pass_used}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Cliente</h4>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{searchResults.user?.full_name || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{searchResults.user?.email || 'N/A'}</span>
                    </div>
                    
                    {searchResults.user?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{searchResults.user.phone}</span>
                      </div>
                    )}
                    
                    {searchResults.user?.company && (
                      <div className="text-sm">
                        <span className="font-medium">Empresa:</span> {searchResults.user.company}
                      </div>
                    )}
                  </div>
                </div>
                
                {searchResults.booking.guests && searchResults.booking.guests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Invitados ({searchResults.booking.guests.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {searchResults.booking.guests.map((guest, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="font-medium">{guest.name}</div>
                          <div className="text-gray-600">{guest.email}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {guest.is_external ? 'Visitante Externo' : 'Coworker'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.booking.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                    <p className="text-sm text-gray-600">{searchResults.booking.notes}</p>
                  </div>
                )}
              </div>
            )}

            {searchResults.type === 'user' && (
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cliente Encontrado
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {searchResults.bookings.length} reservas
                  </Badge>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{searchResults.user.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{searchResults.user.email}</span>
                      </div>
                    </div>
                    <div>
                      {searchResults.user.phone && (
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{searchResults.user.phone}</span>
                        </div>
                      )}
                      {searchResults.user.company && (
                        <div className="text-sm">
                          <span className="font-medium">Empresa:</span> {searchResults.user.company}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Historial de Reservas</h4>
                  {searchResults.bookings.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tiene reservas registradas</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{getSpaceTypeLabel(booking.space_type)}</span>
                              <Badge className={getStatusColor(booking.status)} variant="outline">
                                {getStatusLabel(booking.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>{format(new Date(booking.start_date), 'd/MM/yyyy')}</span>
                              <span>{format(new Date(booking.start_date), 'HH:mm')}</span>
                              {booking.duration_hours > 1 && (
                                <span>{booking.duration_hours}h</span>
                              )}
                              {booking.confirmation_code && (
                                <span>#{booking.confirmation_code}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">${booking.price}</div>
                            {booking.pass_used && (
                              <div className="text-xs text-green-600">Con pase</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(searchResults.type === 'none' || searchResults.type === 'error') && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  {searchResults.message}
                </div>
                <p className="text-sm text-gray-400">
                  Verifica que el código o email sean correctos
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}