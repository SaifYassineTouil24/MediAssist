import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  UserPlus, 
  CalendarPlus, 
  Compass,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

const MedicalHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const user = {
    name: "Dr. Sarah Johnson",
    role: "admin",
    avatar: "/images/default-medcin.png"
  };

  const breadcrumbSegments = ["Tableau de bord", "Patients"];

  // Mock appointment data for calendar
  const appointmentCounts = {
    '2024-01-15': 8,
    '2024-01-16': 12,
    '2024-01-17': 20,
    '2024-01-18': 6
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock patient search
  const handlePatientSearch = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        { id: 1, name: 'Ahmed Benali', phone: '0612345678' },
        { id: 2, name: 'Fatima Alaoui', phone: '0687654321' },
        { id: 3, name: 'Mohammed Tazi', phone: '0656789012' }
      ].filter(patient => 
        patient.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(mockResults);
      setLoading(false);
    }, 300);
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAppointmentColor = (count) => {
    if (count <= 5) return 'bg-green-400';
    if (count <= 10) return 'bg-yellow-400';
    if (count <= 15) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentCalendarMonth);
    const firstDay = getFirstDayOfMonth(currentCalendarMonth);
    const days = [];
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    // Day headers
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      );
    });

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentCalendarMonth.getFullYear()}-${String(currentCalendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = appointmentCounts[dateKey] || 0;
      const isToday = new Date().toDateString() === new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), day).toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 text-center text-sm cursor-pointer rounded-md hover:bg-accent relative ${
            isToday ? 'bg-primary text-primary-foreground' : ''
          }`}
          onClick={() => {
            setSelectedDate(formatDate(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), day)));
            setCalendarOpen(false);
          }}
        >
          {day}
          {count > 0 && (
            <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${getAppointmentColor(count)}`}></div>
          )}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-1">{days}</div>;
  };

  const PatientForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      gender: '',
      birthDay: '',
      cin: '',
      phoneNum: '',
      email: '',
      mutuelle: '',
      allergies: '',
      chronicConditions: '',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Patient data:', formData);
      setPatientModalOpen(false);
      // Here you would typically send the data to your backend
    };

    return (
      <div className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="gender">Sexe *</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Homme</SelectItem>
                <SelectItem value="Female">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="birthDay">Date de naissance *</Label>
            <Input
              id="birthDay"
              type="date"
              value={formData.birthDay}
              onChange={(e) => setFormData({...formData, birthDay: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="cin">CIN *</Label>
            <Input
              id="cin"
              value={formData.cin}
              onChange={(e) => setFormData({...formData, cin: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNum">Téléphone *</Label>
            <Input
              id="phoneNum"
              type="tel"
              value={formData.phoneNum}
              onChange={(e) => setFormData({...formData, phoneNum: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="mutuelle">Mutuelle</Label>
            <Select value={formData.mutuelle} onValueChange={(value) => setFormData({...formData, mutuelle: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Aucune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune</SelectItem>
                <SelectItem value="CNSS">CNSS</SelectItem>
                <SelectItem value="CNOPS">CNOPS</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              rows={2}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="chronicConditions">Maladies chroniques</Label>
            <Textarea
              id="chronicConditions"
              value={formData.chronicConditions}
              onChange={(e) => setFormData({...formData, chronicConditions: e.target.value})}
              rows={2}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setPatientModalOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Enregistrer
          </Button>
        </div>
      </div>
    );
  };

  const AppointmentForm = () => {
    const [appointmentType, setAppointmentType] = useState('consultation');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!selectedPatient || !selectedDate) {
        alert('Veuillez sélectionner un patient et une date');
        return;
      }
      console.log('Appointment data:', {
        patient: selectedPatient,
        date: selectedDate,
        type: appointmentType,
        notes
      });
      setAppointmentModalOpen(false);
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="patient-search">Nom du patient *</Label>
          <div className="relative">
            <Input
              id="patient-search"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                handlePatientSearch(e.target.value);
                setSelectedPatient(null);
              }}
              placeholder="Commencez à taper un nom..."
              className={selectedPatient ? 'border-green-500' : ''}
            />
            {searchResults.length > 0 && !selectedPatient && (
              <Card className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto">
                <CardContent className="p-0">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientSearch(patient.name);
                        setSearchResults([]);
                      }}
                    >
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">{patient.phone}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          {selectedPatient && (
            <Badge variant="secondary" className="mt-2">
              Patient sélectionné: {selectedPatient.name}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Un patient doit exister dans la base de données pour créer un rendez-vous
          </p>
        </div>

        <div>
          <Label>Type de rendez-vous *</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="appointmentType"
                value="consultation"
                checked={appointmentType === 'consultation'}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Consultation</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="appointmentType"
                value="controle"
                checked={appointmentType === 'controle'}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Contrôle</span>
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="appointment-date">Date du rendez-vous *</Label>
          <div className="relative">
            <Input
              id="appointment-date"
              value={selectedDate}
              placeholder="Sélectionnez une date"
              readOnly
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="cursor-pointer"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          {calendarOpen && (
            <Card className="absolute z-20 mt-1 p-4">
              <CardContent className="p-0">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="font-medium">
                    {currentCalendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {renderCalendar()}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span>1-5 RV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span>6-10 RV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span>11-15 RV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>15 RV</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ajouter des notes..."
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setAppointmentModalOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Enregistrer le rendez-vous
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg">
      <div className="flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 bg-blue-700/30 px-4 py-2 rounded-full backdrop-blur-sm">
            <Compass className="h-4 w-4 text-blue-200" />
            <nav className="flex items-center gap-1 text-sm">
              <span className="text-blue-100">Accueil</span>
              {breadcrumbSegments.map((segment, index) => (
                <React.Fragment key={segment}>
                  <span className="text-blue-100">/</span>
                  <span className={index === breadcrumbSegments.length - 1 ? "text-white font-semibold" : "text-blue-100 hover:text-white cursor-pointer"}>
                    {segment}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Live Clock */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 text-blue-100" />
            <span className="font-medium text-white text-sm">
              {currentTime.toLocaleTimeString('fr-FR')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog open={patientModalOpen} onOpenChange={setPatientModalOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau patient</DialogTitle>
                </DialogHeader>
                <PatientForm />
              </DialogContent>
            </Dialog>

            <Dialog open={appointmentModalOpen} onOpenChange={setAppointmentModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Ajouter Rendez-vous
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un rendez-vous</DialogTitle>
                </DialogHeader>
                <AppointmentForm />
              </DialogContent>
            </Dialog>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl">
            <div className="text-right">
              <div className="font-semibold text-sm">{user.name}</div>
              <div className="text-xs text-blue-100">
                {user.role === 'admin' ? 'Médecin' : 'Assistante'}
              </div>
            </div>
            <Avatar className="h-8 w-8 border-2 border-white/50">
              <AvatarImage src={user.avatar} alt="User Profile" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHeader;
