import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { ShoppingCart, Star,ImagePlus } from "lucide-react";
import { useLocation , Link} from "wouter";
import { useTranslation } from 'react-i18next';

interface ProductCardProps {

  product: {
    id: number;
    name: string;
    description?: string;
    basePrice: string;
    imageUrl?: string;
    customizationOptions?: any;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
 
  const { user,isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const [ , setLocation] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      product : product,
      quantity: 1,
      price: product.basePrice,
      customization: {},
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="group card-hover cursor-pointer">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrl || "/placeholder-product.jpg"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
          {user &&(
            <Button
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("productCardQuickAddCTA")}
            </Button>
          )}
          </div>
        </div>
        
        <div className="py-4 px-2">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              <Link href={`/product/?product=${product.id}`} target="_blank">{product.name}</Link>
            </h3>
            <Badge variant="primary" className="ml-2">
              €{product.basePrice}
            </Badge>
          </div>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">(4.8)</span>
            </div>
            
            {product.customizationOptions && (
              <div className="flex space-x-1">
                {product.customizationOptions.colors?.slice(0, 3).map((color: string, index: number) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ 
                      backgroundColor: color === 'white' ? '#ffffff' : color,
                      borderColor: color === 'white' ? '#d1d5db' : 'transparent'
                    }}
                  />
                ))}
                {product.customizationOptions.colors?.length > 3 && (
                  <span className="text-xs text-gray-500 ml-1">
                    +{product.customizationOptions.colors.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          {user ?(
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="w-full mt-3 bg-primary hover:bg-primary/90 text-[0.8rem]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                >
                  {t("productCardAddToCartCTA")}
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button 
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                  onClick={() => setLocation('/create')}
                >
                  {t("productCardCustomizeCTA")}
                  <ImagePlus className="h-4 w-4 mr-2" />
                </Button>
              </div>
          ) : (
              <div className="grid grid-cols-2 gap-2 text-center">
               <Button 
                  className="w-full mt-3 bg-primary hover:bg-primary/90 text-[0.8rem]"
                  onClick={() => setLocation('/signup')}
                >
                  {t("productCardAddToCartCTA")}
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button 
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                  onClick={() => setLocation('/signup')}
                >
                  {t("productCardCustomizeCTA")}
                  <ImagePlus className="h-4 w-4 mr-2" />
                </Button>
              </div>

          )}
          
        </div>
      </CardContent>
    </Card>
  );
}
