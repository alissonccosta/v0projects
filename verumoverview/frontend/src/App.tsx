import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SolicitarAcesso from './pages/SolicitarAcesso';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Projetos from './pages/Projetos';
import Atividades from './pages/Atividades';
import Pessoas from './pages/Pessoas';
import Times from './pages/Times';
import ControleAcesso from './pages/ControleAcesso';
import Usuarios from './pages/Usuarios';
import Perfis from './pages/Perfis';
import Logs from './pages/Logs';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/solicitar-acesso" element={<SolicitarAcesso />} />
      <Route path="/" element={<MainLayout />}> 
        <Route index element={<Dashboard />} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="atividades" element={<Atividades />} />
        <Route path="pessoas" element={<Pessoas />} />
        <Route path="times" element={<Times />} />
        <Route path="controle-acesso" element={<ControleAcesso />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="perfis" element={<Perfis />} />
        <Route path="logs" element={<Logs />} />
      </Route>
    </Routes>
  );
}
