
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Booking } from "@/api/entities";
import { Payment } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, Calendar, DollarSign, TrendingUp, UserPlus, RotateCcw, Percent } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatPrice } from "../components/utils/formatters";
import BookingSearch from "../components/admin/BookingSearch";

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const userData = await User.me();
      
      if (userData.role !== 'admin') {
        window.location.href = '/';
        return;
      }

      setCurrentUser(userData);
      
      const [usersData, bookingsData, paymentsData] = await Promise.all([
        User.list(),
        Booking.list('-created_date'),
        Payment.list('-created_date')
      ]);

      setUsers(usersData);
      setBookings(bookingsData);
      setPayments(paymentsData);
      
      // Calcular KPIs específicos para coworking
      const totalRevenue = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
      const activeBookings = bookingsData.filter(b => b.status === 'confirmed').length;
      const totalMembers = usersData.filter(u => u.role !== 'admin').length;
      
      // Nuevos miembros este mes
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const newMembersThisMonth = usersData.filter(u => {
        const userDate = new Date(u.created_date);
        return userDate.getMonth() === thisMonth && userDate.getFullYear() === thisYear && u.role !== 'admin';
      }).length;

      // Reservas este mes
      const bookingsThisMonth = bookingsData.filter(b => {
        const bookingDate = new Date(b.created_date);
        return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
      }).length;

      // Retención de miembros (simplificado - miembros activos con reservas recientes)
      const activeMembersWithBookings = usersData.filter(u => {
        if (u.role === 'admin') return false;
        const hasRecentBooking = bookingsData.some(b => 
          b.user_id === u.id && 
          new Date(b.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // últimos 30 días
        );
        return hasRecentBooking;
      }).length;

      const memberRetentionRate = totalMembers > 0 ? (activeMembersWithBookings / totalMembers) * 100 : 0;

      // Utilización de recursos (basado en reservas confirmadas)
      const maxDailyCapacity = 20; // Espacios compartidos
      const maxOfficeSlots = 12; // Horas por día
      const totalPossibleSlots = maxDailyCapacity + (maxOfficeSlots * 2); // 2 oficinas
      const utilizationRate = activeBookings > 0 ? (activeBookings / totalPossibleSlots) * 100 : 0;

      // Valor de vida del cliente (promedio de gasto por usuario)
      const memberLifetimeValue = totalMembers > 0 ? totalRevenue / totalMembers : 0;

      setKpis({
        totalRevenue,
        newMembersThisMonth,
        memberRetentionRate: Math.round(memberRetentionRate),
        bookingsThisMonth,
        memberLifetimeValue,
        utilizationRate: Math.round(utilizationRate),
        totalMembers,
        activeBookings
      });

    } catch (error) {
      console.error("Error cargando datos de admin:", error);
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    const csvData = users.map(user => ({
      Nombre: user.full_name,
      Email: user.email,
      Teléfono: user.phone,
      Empresa: user.company,
      'Total Gastado': user.total_spent || 0,
      'Pases Activos': user.active_passes?.length || 0,
      'Fecha Registro': format(new Date(user.created_date), 'dd/MM/yyyy')
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'rocket-room-miembros.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-lg text-gray-600">
              KPIs y gestión de operaciones de Rocket Room
            </p>
          </div>
          <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
        </div>

        {/* Booking Search Component */}
        <BookingSearch />

        {/* KPIs Grid - Basados en el documento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Nuevos Miembros</CardTitle>
              <UserPlus className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpis.newMembersThisMonth}</div>
              <p className="text-xs text-gray-500">Este mes</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Retención de Miembros</CardTitle>
              <RotateCcw className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpis.memberRetentionRate}%</div>
              <p className="text-xs text-gray-500">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Reservas del Mes</CardTitle>
              <Calendar className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpis.bookingsThisMonth}</div>
              <p className="text-xs text-gray-500">Mes actual</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Utilización de Recursos</CardTitle>
              <Percent className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpis.utilizationRate}%</div>
              <p className="text-xs text-gray-500">Ocupación actual</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Valor de Vida del Cliente</CardTitle>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatPrice(kpis.memberLifetimeValue)}</div>
              <p className="text-xs text-gray-500">Promedio por miembro</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatPrice(kpis.totalRevenue)}</div>
              <p className="text-xs text-gray-500">Histórico</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Miembros</CardTitle>
              <Users className="w-4 h-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpis.totalMembers}</div>
              <p className="text-xs text-gray-500">Registrados</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Reservas Activas</CardTitle>
              <Calendar className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpis.activeBookings}</div>
              <p className="text-xs text-gray-500">Confirmadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Miembros */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Gestión de Miembros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Total Gastado</TableHead>
                    <TableHead>Pases Activos</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.role !== 'admin').map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.company || '-'}</TableCell>
                      <TableCell>{formatPrice(user.total_spent || 0)}</TableCell>
                      <TableCell>{user.active_passes?.length || 0}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Activo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
