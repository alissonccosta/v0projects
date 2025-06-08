import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SolicitarAcesso from './pages/SolicitarAcesso';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projetos from './pages/Projetos';
import Atividades from './pages/Atividades';
import Pessoas from './pages/Pessoas';
import Times from './pages/Times';
import ControleAcesso from './pages/ControleAcesso';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/solicitar-acesso" element={<SolicitarAcesso />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="atividades" element={<Atividades />} />
        <Route path="pessoas" element={<Pessoas />} />
        <Route path="times" element={<Times />} />
        <Route path="controle-acesso" element={<ControleAcesso />} />
      </Route>
    </Routes>
  );
}
