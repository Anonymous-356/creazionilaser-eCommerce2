import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function Cancel() {

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Payment Canceled</h2>
          <p className="text-gray-600 mb-6">
            Your payment was canceled. You can go back to your cart and try again.
          </p>
          <Button onClick={() => window.location.href = "/cart"}>
            Back to Cart
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
