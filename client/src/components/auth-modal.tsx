import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AuthView = "login" | "register" | "forgot";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: AuthView;
  onChangeView: (view: AuthView) => void;
}

export default function AuthModal({ isOpen, onClose, view, onChangeView }: AuthModalProps) {
  const { login, register, resetPassword, isLoginPending, isRegisterPending, isResetPending } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (view === "login") {
        await login({ phone, password });
        toast({ title: "Success", description: "Logged in successfully!" });
        onClose();
      } else if (view === "register") {
        await register({ phone, password });
        toast({ title: "Success", description: "Account created successfully!" });
        onClose();
      } else if (view === "forgot") {
        await resetPassword({ phone });
        toast({ title: "Success", description: "Password reset instructions sent!" });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isPending = isLoginPending || isRegisterPending || isResetPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-dark rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {view === "login" ? "Login" : view === "register" ? "Register" : "Reset Password"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254700000000"
              className="w-full px-3 py-2 bg-neutral-darker border border-neutral rounded-md text-white"
              required
            />
          </div>

          {view !== "forgot" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-darker border border-neutral rounded-md text-white"
                required
              />
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Processing..." : 
             view === "login" ? "Login" : 
             view === "register" ? "Register" : "Reset Password"}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {view === "login" && (
            <>
              <button
                onClick={() => onChangeView("register")}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Don't have an account? Register
              </button>
              <br />
              <button
                onClick={() => onChangeView("forgot")}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Forgot password?
              </button>
            </>
          )}
          
          {view === "register" && (
            <button
              onClick={() => onChangeView("login")}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Already have an account? Login
            </button>
          )}
          
          {view === "forgot" && (
            <button
              onClick={() => onChangeView("login")}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
  }
