import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from 'react-i18next';

function Products({categoryID,categoryName}){
  
  const { data: products = [], isLoading } = useQuery({
      queryKey: ["/api/products", categoryID],
      queryFn: async () => {
        const url = categoryID && categoryID !== "all"
          ? `/api/products?category=${categoryID}`
          : "/api/products";
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
      },
  });

  if(products.length > 0)
  
  return (
    <>
      <div className="mb-8 mt-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{categoryName}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {products.filter((product,index) => index < 5).map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )

}

export default function GiftIdeas() {

  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: categories = [],isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Filters */}
      
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("giftIdeasMainTitle")}</h2>
        <p className="text-xl text-gray-600">{t("giftIdeasMainDesc")}</p>
      </div>

      {/* Header */}
      {Array.isArray(categories) && categories.filter((category,index) => index < 4).map((category: any) => (
        <Products key={category.slug} categoryID={category.slug} categoryName={category.name}/>
      ))}
    </div>
  );
}