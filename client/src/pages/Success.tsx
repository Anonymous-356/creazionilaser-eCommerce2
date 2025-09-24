import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";

export default function Success() {

  const { t, i18n } = useTranslation();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{t("cartCheckoutSucceededTitle")}</h2>
          <p className="text-gray-600 mb-6">
            {t("cartCheckoutSucceededDescription")}
          </p>
          <Button onClick={() => window.location.href = "/shop"}>
            {t("cartPageContinueBtn")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
