import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import DesignCard from "@/components/DesignCard";
import { useTranslation } from 'react-i18next';

export default function Designs() {

  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: artists = [] } = useQuery({
    queryKey: ["/api/artists"],
  });

  console.log(artists);

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ["/api/designs", selectedArtist],
    queryFn: async () => {
      const url = selectedArtist && selectedArtist !== "all"
        ? `/api/designs?artist=${selectedArtist}`
        : "/api/designs";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch design');
      return response.json();
    },
  });

  console.log(designs);

  const filteredDesigns = designs
    .filter((design: any) => 
      design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "title":
        default:
          return a.title.localeCompare(b.title);
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
      {/* Header */}
      <div className="mb-16 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("artworkTitle")}</h1>
        <p className="text-lg text-gray-600">
          {t("artworkDesc")}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center justify-between md:space-x-4">
        
       {/* Results count */}
        <div className="flex md:items-start justify-start">
          <p className="text-gray-600">
            Showing {filteredDesigns.length} of {designs.length} designs
          </p>
        </div>

        <div className="flex md:items-end justify-end">

          <p className="text-gray-600 mb-2 mr-2">{t("artworkSortTitle")} : </p>

          <Select value={selectedArtist} onValueChange={setSelectedArtist}>
            <SelectTrigger className="w-full md:w-48 md:mr-2">
              <SelectValue placeholder={t("artworkSortByName")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("artworkSortByName")}</SelectItem>
              {Array.isArray(artists) && artists.map((artist: any) => (
                <SelectItem key={artist.specialty} value={artist.artistId}>
                  {artist.firstName+' '+artist.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("SortByAlphabets")}</SelectItem>
              <SelectItem value="price-low">{t("SortByLowToHigh")}</SelectItem>
              <SelectItem value="price-high">{t("SortByHighToLow")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

       {/* Design grid */}
      {filteredDesigns.length === 0 ? (
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
              setSelectedArtist("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredDesigns.map((design: any) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}
