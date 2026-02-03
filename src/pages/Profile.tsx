import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Camera, MessageCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useProfileByUsername, useUploadAvatar, useUploadBanner } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import { useFollowersCount, useFollowingCount, useIsFollowing, useToggleFollow } from '@/hooks/useFollows';
import { useConversations } from '@/hooks/useMessages';
import { PostCard } from '@/components/posts/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const { data: currentUserProfile } = useProfile();
  
  // If viewing another user's profile, fetch by username
  const { data: profileByUsername, isLoading: profileByUsernameLoading } = useProfileByUsername(username);
  const { data: ownProfile, isLoading: ownProfileLoading } = useProfile();
  
  // Determine which profile to show
  const isOwnProfile = !username || username === currentUserProfile?.username;
  const profile = isOwnProfile ? ownProfile : profileByUsername;
  const profileLoading = isOwnProfile ? ownProfileLoading : profileByUsernameLoading;

  const { data: posts, isLoading: postsLoading } = useUserPosts(profile?.id || '');
  
  // Follow system
  const { data: followersCount = 0 } = useFollowersCount(profile?.id || '');
  const { data: followingCount = 0 } = useFollowingCount(profile?.id || '');
  const { data: isFollowing = false } = useIsFollowing(profile?.id || '');
  const toggleFollow = useToggleFollow();
  const { startConversation } = useConversations();
  
  const uploadAvatar = useUploadAvatar();
  const uploadBanner = useUploadBanner();
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file, {
        onSuccess: () => toast.success('Foto de perfil actualizada'),
        onError: () => toast.error('Error al subir la imagen'),
      });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadBanner.mutate(file, {
        onSuccess: () => toast.success('Banner actualizado'),
        onError: () => toast.error('Error al subir la imagen'),
      });
    }
  };

  const handleFollowToggle = () => {
    if (!profile?.id) return;
    toggleFollow.mutate(
      { targetUserId: profile.id, isFollowing },
      {
        onSuccess: () => {
          toast.success(isFollowing ? 'Has dejado de seguir' : '¡Ahora sigues a este usuario!');
        },
        onError: () => toast.error('Error al procesar la solicitud'),
      }
    );
  };

  const handleStartConversation = async () => {
    if (!profile?.id) return;
    try {
      const conversationId = await startConversation(profile.id);
      navigate('/messages');
    } catch (error) {
      toast.error('Error al iniciar conversación');
    }
  };

  if (profileLoading) {
    return (
      <MainLayout>
        <div className="p-4">
          <Skeleton className="h-48 w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <p className="text-lg">Usuario no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const joinDate = format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: es });

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
          <p className="text-sm text-muted-foreground">{posts?.length || 0} posts</p>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-48 bg-muted">
        {profile.banner_url && (
          <img
            src={profile.banner_url}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        )}
        {isOwnProfile && (
          <>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-4 rounded-full opacity-80 hover:opacity-100"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadBanner.isPending}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative border-b border-border px-4 pb-4">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-4xl">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full opacity-80 hover:opacity-100"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 top-4">
          {isOwnProfile ? (
            <Link to="/settings">
              <Button variant="outline" className="rounded-full">
                Editar perfil
              </Button>
            </Link>
          ) : user ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleStartConversation}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full"
                onClick={handleFollowToggle}
                disabled={toggleFollow.isPending}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Name and Username */}
        <h2 className="text-xl font-bold">{profile.full_name || profile.username}</h2>
        <p className="text-muted-foreground">@{profile.username}</p>

        {/* Bio */}
        {profile.bio && <p className="mt-3">{profile.bio}</p>}

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Se unió en {joinDate}</span>
          </div>
        </div>

        {/* Following/Followers */}
        <div className="mt-3 flex gap-4">
          <Link to={`/user/${profile.username}/following`} className="hover:underline">
            <span className="font-bold">{followingCount}</span>{' '}
            <span className="text-muted-foreground">Siguiendo</span>
          </Link>
          <Link to={`/user/${profile.username}/followers`} className="hover:underline">
            <span className="font-bold">{followersCount}</span>{' '}
            <span className="text-muted-foreground">Seguidores</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger 
            value="posts" 
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="replies" 
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Respuestas
          </TabsTrigger>
          <TabsTrigger 
            value="media" 
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Multimedia
          </TabsTrigger>
          <TabsTrigger 
            value="likes" 
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Me gusta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {postsLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>Aún no hay publicaciones</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          <div className="p-8 text-center text-muted-foreground">
            <p>Aún no hay respuestas</p>
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <div className="p-8 text-center text-muted-foreground">
            <p>Aún no hay multimedia</p>
          </div>
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          <div className="p-8 text-center text-muted-foreground">
            <p>Aún no hay me gusta</p>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}