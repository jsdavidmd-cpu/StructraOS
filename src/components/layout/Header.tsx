import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export default function Header() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Construction Management System</h1>
        <p className="text-sm text-muted-foreground">Philippines</p>
      </div>

      <div className="absolute right-6 flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center space-x-3 pl-4 border-l">
          <div className="text-right">
            <div className="text-sm font-medium">{profile?.full_name || 'User'}</div>
            <div className="text-xs text-muted-foreground capitalize">{profile?.role}</div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
