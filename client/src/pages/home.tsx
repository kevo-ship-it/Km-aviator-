import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import UserHeader from "@/components/user-header";
import GameArea from "@/components/game-area";
import BettingControls from "@/components/betting-controls";
import GameTabs from "@/components/game-tabs";
import MobileNavigation from "@/components/mobile-navigation";
import AuthModal from "@/components/auth-modal";

export default function Home() {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    view: "login" as "login" | "register" | "forgot"
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.error("getUser error:", error.message);
      }

      setUser(user || null);
    };

    getUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openLoginModal = () => setAuthModal({ isOpen: true, view: "login" });
  const openRegisterModal = () => setAuthModal({ isOpen: true, view: "register" });
  const closeAuthModal = () => setAuthModal({ ...authModal, isOpen: false });

  return (
    <div className="min-h-screen bg-neutral">
      <UserHeader 
        openLoginModal={openLoginModal}
        openRegisterModal={openRegisterModal}
        user={user}
      />

      <main className="max-w-7xl mx-auto p-4">
        {user ? (
          <>
            <GameArea />
            <BettingControls />
            <GameTabs />
          </>
        ) : (
          <div className="text-center mt-20">
            <h2 className="text-white text-xl mb-6">Welcome to KM Aviator!</h2>
            <div className="space-x-4">
              <button onClick={openLoginModal} className="bg-blue-600 px-4 py-2 rounded text-white">Log In</button>
              <button onClick={openRegisterModal} className="bg-gray-500 px-4 py-2 rounded text-white">Create Account</button>
            </div>
          </div>
        )}
      </main>

      <MobileNavigation />

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        view={authModal.view}
        onChangeView={(view) => setAuthModal({ ...authModal, view })}
      />
    </div>
  );
                                            }
