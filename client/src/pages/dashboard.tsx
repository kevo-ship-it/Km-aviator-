import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        alert("Not logged in. Redirecting to home.");
        setLocation("/");
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl mb-4">Dashboard</h2>
      {user ? (
        <>
          <p className="mb-4">User ID: {user.id}</p>
          <div className="space-x-4">
            <button className="bg-blue-600 px-4 py-2 rounded">Bet</button>
            <button className="bg-green-600 px-4 py-2 rounded">Deposit</button>
            <button className="bg-yellow-600 px-4 py-2 rounded">Withdraw</button>
          </div>
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
              }
      
