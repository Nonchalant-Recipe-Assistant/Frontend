import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
// 1. Импорт
import { useTranslation } from "react-i18next";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  // 2. Хук
  const { t } = useTranslation();
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  // 3. Используем t() для начального состояния
  const [message, setMessage] = useState(t('verifyEmail.status.ready'));

  const runVerification = async () => {
    if (!token) {
      setStatus("error");
      setMessage(t('verifyEmail.status.noToken'));
      return;
    }

    setStatus("loading");
    setMessage(t('verifyEmail.status.connecting'));
    
    // DEBUG LOGS - Check your browser console (F12) for these
    console.log("🚀 Starting verification...");
    console.log("🔑 Token:", token);

    try {
      const result = await verifyEmail(token);
      console.log("✅ API Result:", result);

      if (result.success) {
        setStatus("success");
        setMessage(t('verifyEmail.status.success'));
      } else {
        setStatus("error");
        setMessage(result.error || t('verifyEmail.status.failed'));
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      setStatus("error");
      setMessage(t('verifyEmail.status.error'));
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
          <CardTitle>{t('verifyEmail.title')}</CardTitle>
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
                {t('verifyEmail.buttons.goToApp')}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-700 font-medium">{message}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/")}>
                  {t('verifyEmail.buttons.home')}
                </Button>
                {/* Manual Retry Button */}
                <Button onClick={runVerification}>
                  {t('verifyEmail.buttons.tryAgain')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}