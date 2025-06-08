import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SolicitarAcesso from './pages/SolicitarAcesso';
import Dashboard from './pages/Dashboard';
import Projetos from './pages/Projetos';
import Atividades from './pages/Atividades';
import Pessoas from './pages/Pessoas';
import Times from './pages/Times';
import ControleAcesso from './pages/ControleAcesso';
import MainLayout from './components/layout/MainLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/solicitar-acesso" element={<SolicitarAcesso />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/atividades" element={<Atividades />} />
        <Route path="/pessoas" element={<Pessoas />} />
        <Route path="/times" element={<Times />} />
        <Route path="/controle-acesso" element={<ControleAcesso />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
