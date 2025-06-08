import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../hooks/AuthContext';
import { logAction } from '../services/logger';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    try {
      await login(email, senha);
      logAction('login');
      navigate('/');
    } catch (err: any) {
      if ((err as any).response?.status === 401) {
        setErro('Credenciais inválidas');
      } else if (!(err as any).response) {
        setErro('Erro ao conectar com o servidor');
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary dark:bg-dark-background p-4">
      <div className="w-full max-w-sm">
        <Card title="VerumOverview">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (erro) setErro('');
              }}
              error={erro || undefined}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => {
                setSenha(e.target.value);
                if (erro) setErro('');
              }}
              error={erro || undefined}
            />
            <Button type="submit" className="w-full">
              Entrar
            </Button>
            {erro && <p className="text-red-500 mt-2">{erro}</p>}
            <p className="mt-2 text-center">
              <Link to="/solicitar-acesso" className="text-secondary hover:underline">
                Solicitar acesso
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
