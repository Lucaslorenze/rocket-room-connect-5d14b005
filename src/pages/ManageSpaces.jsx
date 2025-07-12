import React, { useState, useEffect } from "react";
import { Space } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatPrice } from "@/components/utils/formatters";

export default function ManageSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSpace, setEditingSpace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  
  const getInitialFormData = () => ({
    name: '',
    type: 'shared_coworking',
    capacity: 1,
    hourly_price: 0,
    daily_price: 0,
    monthly_price: 0,
    description: '',
    features: [],
    max_daily_capacity: 20,
    is_active: true
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      
      setUser(userData);
      const spacesData = await Space.list();
      setSpaces(spacesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSpace) {
        await Space.update(editingSpace.id, formData);
        setMessage({ type: 'success', text: 'Espacio actualizado exitosamente' });
      } else {
        await Space.create(formData);
        setMessage({ type: 'success', text: 'Espacio creado exitosamente' });
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar el espacio' });
    }
  };

  const handleEdit = (space) => {
    setEditingSpace(space);
    setFormData({ ...getInitialFormData(), ...space });
    setShowForm(true);
  };

  const handleDelete = async (spaceId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este espacio?')) {
      try {
        await Space.delete(spaceId);
        setMessage({ type: 'success', text: 'Espacio eliminado exitosamente' });
        await loadData();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al eliminar el espacio' });
      }
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingSpace(null);
    setShowForm(false);
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    setFormData({ ...formData, features: (formData.features || []).filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto"><div className="animate-pulse">Cargando...</div></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Espacios</h1>
              <p className="text-gray-600">Administra los espacios de trabajo de Rocket Room</p>
            </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Espacio
          </Button>
        </div>

        {message && (
          <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>{message.text}</AlertDescription>
          </Alert>
        )}

        {showForm && (
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingSpace ? 'Editar Espacio' : 'Crear Nuevo Espacio'}</span>
                <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-4 h-4" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Espacio</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <select id="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded">
                      <option value="shared_coworking">Coworking Compartido</option>
                      <option value="private_office_4">Oficina Privada (4p)</option>
                      <option value="private_office_6">Oficina Privada (6p)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hourly_price">Precio por Hora</Label>
                    <Input id="hourly_price" type="number" value={formData.hourly_price} onChange={(e) => setFormData({...formData, hourly_price: parseFloat(e.target.value) || 0})} />
                  </div>
                   <div>
                    <Label htmlFor="daily_price">Precio por Día</Label>
                    <Input id="daily_price" type="number" value={formData.daily_price} onChange={(e) => setFormData({...formData, daily_price: parseFloat(e.target.value) || 0})} />
                  </div>
                   <div>
                    <Label htmlFor="capacity">Capacidad (personas)</Label>
                    <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                 <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Características</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}><Plus className="w-4 h-4 mr-2" />Agregar</Button>
                  </div>
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} />
                      <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 mr-2" />{editingSpace ? 'Actualizar' : 'Crear'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <Card key={space.id} className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{space.name}</CardTitle>
                <p className="text-gray-500 capitalize">{space.type.replace('_', ' ')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Precio por Hora: {formatPrice(space.hourly_price)}</p>
                <p>Precio por Día: {formatPrice(space.daily_price)}</p>
                <p>Capacidad: {space.capacity} personas</p>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(space)} className="flex-1"><Edit className="w-4 h-4 mr-2" />Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(space.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}