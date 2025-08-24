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

export default function Shop() {

  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory && selectedCategory !== "all"
        ? `/api/products?category=${selectedCategory}`
        : "/api/products";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const filteredProducts = products
    .filter((product: any) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.basePrice) - parseFloat(b.basePrice);
        case "price-high":
          return parseFloat(b.basePrice) - parseFloat(a.basePrice);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
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
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("shopPageSearchBarPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t("shopPageSortByCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("shopPageSortByCategory")}</SelectItem>
            {Array.isArray(categories) && categories.map((category: any) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t("shopPageSortByPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t("SortByAlphabets")}</SelectItem>
            <SelectItem value="price-low">{t("SortByLowToHigh")}</SelectItem>
            <SelectItem value="price-high">{t("SortByHighToLow")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("loggedInHomeShopTitle")}</h2>
        <p className="text-xl text-gray-600">{t("loggedInHomeShopDesc")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-stagger">
        {categories.map((category: any) => (
          <Card 
            key={category.id} 
            className="group cursor-pointer card-hover"
            onClick={() => setSelectedCategory(category.slug)}
          >
            <CardContent className="p-6 text-center">
              <img 
                src={category.imageUrl} 
                alt={category.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{t("loggedInHomeShopRedirectHook")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8 mt-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("shopPageTitle")}</h1>
      </div>

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("NoRecordFound")}</h3>
          <p className="text-gray-600 mb-4">
            {t("NoRecordFoundTagline")}
          </p>
          <Button 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
