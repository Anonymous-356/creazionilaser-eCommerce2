import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { XCircle } from "lucide-react";

export default function Cancel() {

  const { t, i18n } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{t("cartCheckoutCancelledTitle")}</h2>
          <p className="text-gray-600 mb-6">
            {t("cartCheckoutCancelledDescription")}
          </p>
          <Button onClick={() => window.location.href = "/cart"}>
            {t("cartPageRedirectAction")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
