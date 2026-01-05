import React, { useState, createContext } from 'react';
import MedicalHeader from './components/header'; // Import your existing header component
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

// App Context for global state
const AppContext = createContext();

// Simple Dashboard Component
const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tableau de Bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patients Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">+20% ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>RV Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-sm text-muted-foreground">8 confirmés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>RV Cette Semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">+12% vs semaine dernière</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Activités Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les données seront affichées ici...</p>
          {/* TODO: Add your backend data here */}
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Patients Component
const Patients = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Patients</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Liste des patients sera affichée ici...</p>
          {/* TODO: Add your patients list from backend */}
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Appointments Component  
const Appointments = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Rendez-vous</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Liste des rendez-vous sera affichée ici...</p>
          {/* TODO: Add your appointments list from backend */}
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Mock user data - replace with your auth system
  const user = {
    name: "Dr. Sarah Johnson",
    role: "admin",
    avatar: "/images/default-medcin.png"
  };

  // Mock breadcrumbs - update based on current page
  const getBreadcrumbs = () => {
    switch(currentPage) {
      case 'patients':
        return ['Patients'];
      case 'appointments':
        return ['Rendez-vous'];
      default:
        return ['Tableau de bord'];
    }
  };

  // App context value
  const contextValue = {
    user,
    currentPage,
    breadcrumbs: getBreadcrumbs(),
    setCurrentPage
  };

  // Render current page content
  const renderContent = () => {
    switch(currentPage) {
      case 'patients':
        return <Patients />;
      case 'appointments':
        return <Appointments />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {/* Your existing header component */}
        <MedicalHeader />
        
        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="px-6">
            <Tabs value={currentPage} onValueChange={setCurrentPage}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main Content */}
        <main>
          {renderContent()}
        </main>
      </div>
    </AppContext.Provider>
  );
};

// Export the context so your header component can use it
export { AppContext };
export default App;
