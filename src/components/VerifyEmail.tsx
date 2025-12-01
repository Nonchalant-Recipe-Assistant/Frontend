import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Ready to verify.");

  const runVerification = async () => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    setStatus("loading");
    setMessage("Connecting to server...");
    
    // DEBUG LOGS - Check your browser console (F12) for these
    console.log("🚀 Starting verification...");
    console.log("🔑 Token:", token);

    try {
      const result = await verifyEmail(token);
      console.log("✅ API Result:", result);

      if (result.success) {
        setStatus("success");
        setMessage("Email verified successfully!");
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed.");
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      setStatus("error");
      setMessage("An unexpected error occurred. Check Console.");
    }
  };

  // Run automatically on mount
  useEffect(() => {
    if (token && status === "idle") {
      runVerification();
    }
  }, [token, status]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="text-green-700 font-medium">{message}</p>
              <Button onClick={() => navigate("/")} className="mt-2 bg-green-600 hover:bg-green-700">
                Go to App
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-700 font-medium">{message}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Home
                </Button>
                {/* Manual Retry Button */}
                <Button onClick={runVerification}>
                  Try Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}