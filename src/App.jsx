import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/users/UserManagement';
import MachineCatalog from './components/machinery/MachineCatalog';
import ChecklistBuilder from './components/checklists/ChecklistBuilder';
import ChecklistExecution from './components/checklists/ChecklistExecution';
import IncidentReport from './components/incidents/IncidentReport';
import IncidentList from './components/incidents/IncidentList';
import AlertPanel from './components/alerts/AlertPanel';

function AppContent() {
  const { usuario } = useApp();
  const [vista, setVista] = useState('dashboard');
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);

  if (!usuario) return <Login />;

  const cambiarVista = (v) => { setMaquinaSeleccionada(null); setVista(v); };

  const renderVista = () => {
    switch (vista) {
      case 'dashboard':     return <Dashboard setVista={cambiarVista} setMaquinaSeleccionada={setMaquinaSeleccionada} />;
      case 'usuarios':      return <UserManagement />;
      case 'maquinaria':    return <MachineCatalog rol={usuario.rol} maquinaInicial={maquinaSeleccionada} setVista={cambiarVista} />;
      case 'buscar':        return <MachineCatalog rol={usuario.rol} setVista={cambiarVista} />;
      case 'checklists':    return <ChecklistBuilder />;
      case 'checklist-exec':return <ChecklistExecution />;
      case 'incidencias':   return <IncidentList />;
      case 'mis-registros': return <IncidentList />;
      case 'reportar':      return <IncidentReport />;
      case 'historial':     return <IncidentList mostrarHistorial={true} />;
      case 'metricas':      return <Dashboard setVista={cambiarVista} />;
      case 'alertas':       return <AlertPanel />;
      default:              return <Dashboard setVista={cambiarVista} />;
    }
  };

  return (
    <Layout vista={vista} setVista={cambiarVista}>
      {renderVista()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
