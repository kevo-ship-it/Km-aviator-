import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import type { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.warn("Auth error:", error?.message);
        alert("Not logged in. Redirecting to home.");
        setLocation("/");
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, [setLocation]);

  if (!user) {
    return <div className="p-4 text-white">Loading user...</div>;
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl mb-4">Dashboard</h2>
      <p className="mb-4">User ID: {user.id}</p>
      <div className="space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Bet</button>
        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Deposit</button>
        <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded">Withdraw</button>
      </div>
    </div>
  );
      }
        
