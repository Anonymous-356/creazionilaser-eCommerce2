import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card,CardHeader,CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Star,ImagePlus } from "lucide-react";
import { useLocation , Link} from "wouter";
import { useTranslation } from 'react-i18next';

export default function Product() {

  const { t, i18n } = useTranslation();
  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get('product');

  const [ , setLocation] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product,isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });

  const handleAddToCart = () => {
    addToCart({
      productId: product?.id,
      product : product,
      quantity: 1,
      price: product?.basePrice,
      customization: {},
    });
    
    toast({
      title: "Added to cart",
      description: `${product?.name} has been added to your cart.`,
    });
  };
  

  console.log(product);

  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:text-4xl grid grid-cols-2 gap-6">
        <div className="">
         <Card>
            <CardContent className="pt-8">
              <img src={product?.imageUrl} alt="Product Main Image" className="h-64 w-72"/>
            </CardContent>
          </Card>
        </div>
        <div className="">
          <Card>
            <CardHeader className="">
              <CardTitle>{t("productDetailsPageTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <p className="text-lg text-gray-900"><b>{t("productDetailsTitle")} :</b> {product?.name}</p>
              <p className="text-lg text-gray-900"><b>{t("productDetailsDesc")} :</b> {product?.description}</p>
              <p className="text-lg text-gray-900"><b>{t("productDetailsBasePrice")} :</b> {product?.basePrice}</p>
              <p className="text-lg text-gray-900"><b>{t("productDetialsCustomizationOptions")} :</b> {new Date(product?.createdAt).toLocaleDateString()}</p>
              <p className="text-lg text-gray-900"><b>{t("productDetailsDate")}:</b>
                 {/* { product?.customizationOptions && (
                   product?.customizationOptions.quantities.map(option => {
                    <span>{option}</span>
                 })
                )} */}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                >
                  {t("productCardAddToCartCTA")}
                  <ShoppingCart className="h-4 w-4 mr-2" />
                </Button>
                <Button 
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                  onClick={() => setLocation('/create')}
                >
                  {t("productCardCustomizeCTA")}
                  <ImagePlus className="h-4 w-4 mr-2" />
                </Button>
              </div>  

            </CardContent>
          </Card>
        </div>
        
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("produtcDetailsPageDesc")}</h1>
        <p className="text-lg text-gray-600">
          {product?.description}
        </p>
      </div>
 
    </div>
    </>
    
  );
}
