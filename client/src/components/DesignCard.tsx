import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart,HeartPlus, Star } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { useQuery,useMutation } from "@tanstack/react-query";


interface DesignCardProps {
  design: {
    id: number;
    artistId : number;
    title: string;
    description?: string;
    price: string;
    imageUrl?: string;
    artistFirstName?: string;
    artistLastName?: string;
    customizationOptions?: any;
  };
}

export default function DesignCard({ design }: DesignCardProps) {

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const createWishListMutation = useMutation({
      
      mutationFn: async (formData: any) => {
       
        const response = await fetch("/api/wishlist", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to add into wishlist");
        return response.json();
      },
    
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Added into wishlist successfully!",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleWishlist = (designID,userID) => {
      const fromData = {
        designID,
        userID
      }  
      createWishListMutation.mutate(fromData);
  };

  return (
    <Card className="group card-hover cursor-pointer">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={design.imageUrl || "/placeholder-product.jpg"}
            alt={design.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex justify-end">
            {isAuthenticated && (
              <Button 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlist(design.id,design.artistId);
                }}
              >
                <HeartPlus className="h-4 w-4 items-center" />
              </Button>
            )}
            
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {design.title}
            </h3>
            <Badge variant="secondary" className="ml-2">
              €{design.price}
            </Badge>
          </div>
          
          {design.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {design.description}
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
           <div className="flex items-center space-x-1 text-end">{design.artistFirstName+' '+design.artistLastName}</div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
