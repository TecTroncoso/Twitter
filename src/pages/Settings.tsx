import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, User } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

export default function Settings() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isPrivate, setIsPrivate] = useState(profile?.is_private || false);

  // Update local state when profile loads
  useState(() => {
    if (profile) {
      setUsername(profile.username);
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setIsPrivate(profile.is_private);
    }
  });

  const handleSave = () => {
    updateProfile.mutate(
      {
        username,
        full_name: fullName || null,
        bio: bio || null,
        is_private: isPrivate,
      },
      {
        onSuccess: () => toast.success('Perfil actualizado'),
        onError: (error) => toast.error('Error al actualizar', { description: error.message }),
      }
    );
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <Link to="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Configuración</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Settings Content */}
      <div className="space-y-6 p-4">
        {/* Profile Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Información del perfil</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="usuario123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Privacy Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Privacidad</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cuenta privada</p>
              <p className="text-sm text-muted-foreground">
                Solo tus seguidores podrán ver tus publicaciones
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </section>

        <Separator />

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </MainLayout>
  );
}
