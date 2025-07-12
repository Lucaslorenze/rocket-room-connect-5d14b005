import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User as UserIcon, Phone, Building, Mail } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        company: userData.company || ''
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await User.updateMyUserData(formData);
      const updatedUser = await User.me();
      setUser(updatedUser);
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Profile Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account information and preferences
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <UserIcon className="w-6 h-6" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Enter your company name"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Email Address</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Account Type</p>
                    <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Total Spent</p>
                    <p className="text-sm text-gray-600">${user?.total_spent || 0}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}