import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface UserHeaderProps {
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

export default function UserHeader({ openLoginModal, openRegisterModal }: UserHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-neutral-darker border-b border-neutral-dark p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-display font-bold text-white">AVIATOR</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="text-white">
                <span className="text-gray-400">Balance: </span>
                <span className="font-bold text-green-400">KSh {user.balance.toLocaleString()}</span>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Phone: </span>
                <span>{user.phone}</span>
              </div>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button onClick={openLoginModal} variant="outline">
                Login
              </Button>
              <Button onClick={openRegisterModal}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
      }
