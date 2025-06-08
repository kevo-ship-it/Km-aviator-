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
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const openLoginModal = () => setAuthModal({ isOpen: true, view: "login" });
  const openRegisterModal = () => setAuthModal({ isOpen: true, view: "register" });
  const closeAuthModal = () => setAuthModal({ ...authModal, isOpen: false });

  const debugAuthMe = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      alert(JSON.stringify(json, null, 2)); // You can also use console.log(json);
    } catch (err) {
      alert("Error calling /api/auth/me");
      console.error(err);
    }
  };

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

            {/* Debug Button for Auth */}
            <div className="mt-6">
              <button 
                onClick={debugAuthMe}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white"
              >
                Debug /api/auth/me
              </button>
            </div>
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
    
