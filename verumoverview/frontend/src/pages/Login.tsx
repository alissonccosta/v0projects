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
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-primaryDark via-primary to-primaryLight dark:from-dark-background dark:via-dark-card dark:to-primaryDark">
      <div className="hidden md:flex items-center justify-center">
        <img
          src="https://source.unsplash.com/600x800/?technology"
          alt="Ilustração"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-6">
          <h1 className="text-2xl font-bold text-center text-primary mb-4">VerumOverview</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
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
