import React, { useState, useEffect } from "react";
import { Pass } from "@/api/entities";
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

export default function ManagePlans() {
  const [passes, setPasses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPass, setEditingPass] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  
  const getInitialFormData = () => ({
    name: '',
    type: '',
    price: 0,
    validity_days: 30,
    description: '',
    services_included: {
      day_passes: 0,
      private_office_hours: 0,
      meeting_room_hours: 0
    },
    features: [],
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
        window.location.href = createPageUrl("Plans");
        return;
      }
      
      setUser(userData);
      const passesData = await Pass.list();
      setPasses(passesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPass) {
        await Pass.update(editingPass.id, formData);
        setMessage({ type: 'success', text: 'Plan actualizado exitosamente' });
      } else {
        await Pass.create(formData);
        setMessage({ type: 'success', text: 'Plan creado exitosamente' });
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar el plan' });
    }
  };

  const handleEdit = (pass) => {
    setEditingPass(pass);
    setFormData({
      name: pass.name || '',
      type: pass.type || '',
      price: pass.price || 0,
      validity_days: pass.validity_days || 30,
      description: pass.description || '',
      services_included: {
        day_passes: pass.services_included?.day_passes || 0,
        private_office_hours: pass.services_included?.private_office_hours || 0,
        meeting_room_hours: pass.services_included?.meeting_room_hours || 0
      },
      features: pass.features || [],
      is_active: pass.is_active !== undefined ? pass.is_active : true
    });
    setShowForm(true);
  };

  const handleDelete = async (passId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        await Pass.delete(passId);
        setMessage({ type: 'success', text: 'Plan eliminado exitosamente' });
        await loadData();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al eliminar el plan' });
      }
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingPass(null);
    setShowForm(false);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), '']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: (formData.features || []).filter((_, i) => i !== index)
    });
  };

  const updateServiceIncluded = (service, value) => {
    setFormData({
      ...formData,
      services_included: {
        ...formData.services_included,
        [service]: parseInt(value) || 0
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
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
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Plans")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
              <p className="text-gray-600">Administra los planes y pases de Rocket Room</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Plan
          </Button>
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

        {showForm && (
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingPass ? 'Editar Plan' : 'Crear Nuevo Plan'}</span>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Plan</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="ej: Smart Pass"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      placeholder="ej: smart_pass"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio (ARS)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="validity_days">Validez (días)</Label>
                    <Input
                      id="validity_days"
                      type="number"
                      value={formData.validity_days}
                      onChange={(e) => setFormData({...formData, validity_days: parseInt(e.target.value) || 30})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del plan..."
                    className="h-24"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Servicios Incluidos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="day_passes">Day Passes</Label>
                      <Input
                        id="day_passes"
                        type="number"
                        value={formData.services_included?.day_passes || 0}
                        onChange={(e) => updateServiceIncluded('day_passes', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="private_office_hours">Horas de Oficina</Label>
                      <Input
                        id="private_office_hours"
                        type="number"
                        value={formData.services_included?.private_office_hours || 0}
                        onChange={(e) => updateServiceIncluded('private_office_hours', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="meeting_room_hours">Horas de Sala</Label>
                      <Input
                        id="meeting_room_hours"
                        type="number"
                        value={formData.services_included?.meeting_room_hours || 0}
                        onChange={(e) => updateServiceIncluded('meeting_room_hours', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Características</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                  
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="ej: WiFi de alta velocidad"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Plan activo</Label>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    {editingPass ? 'Actualizar' : 'Crear'} Plan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passes.map((pass) => (
            <Card key={pass.id} className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{pass.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={pass.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {pass.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">${pass.price}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600">{pass.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Servicios:</h4>
                  <div className="text-sm space-y-1">
                    {(pass.services_included?.day_passes || 0) > 0 && (
                      <div>• {pass.services_included.day_passes} day passes</div>
                    )}
                    {(pass.services_included?.private_office_hours || 0) > 0 && (
                      <div>• {pass.services_included.private_office_hours} horas de oficina</div>
                    )}
                    {(pass.services_included?.meeting_room_hours || 0) > 0 && (
                      <div>• {pass.services_included.meeting_room_hours} horas de sala</div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(pass)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pass.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}