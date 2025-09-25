import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ProductCustomizer from "@/components/ProductCustomizer";
import { Upload, Palette, Type, Eye } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Create() {
  
  const { t, i18n } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [customText, setCustomText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedSize, setSelectedSize] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: designs = [] } = useQuery({
    queryKey: ["/api/designs"],
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedDesign(null); // Clear selected design when uploading custom file
    }
  };

  const customizationOptions = selectedProduct?.customizationOptions || {};
  const basePrice = selectedProduct ? parseFloat(selectedProduct.basePrice) : 0;
  const designPrice = selectedDesign ? parseFloat(selectedDesign.price) : 0;
  const totalPrice = basePrice + designPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("createPageMainTitle")}</h1>
        <p className="text-xl text-gray-600">{t("createPageMainTagline")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Customization Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                {t("createPageCustomizeFormTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Selection */}
              <div>
                <Label htmlFor="product-select">{t("createPageInputProductType")}</Label>
                <Select onValueChange={(value) => {
                  const product = products.find((p: any) => p.id.toString() === value);
                  setSelectedProduct(product);
                  setSelectedSize(""); // Reset size when product changes
                }}>
                  <SelectTrigger id="product-select">
                    <SelectValue placeholder={t("createPageInputProductTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - €{product.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="file-upload">{t("createPageInputUploadDesign")}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {uploadedFile ? uploadedFile.name : t("createPageInputUploadDesignPlaceholder")}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, SVG up to 10MB</p>
                  </label>
                </div>
              </div>

              {/* Design Gallery */}
              <div>
                <Label>{t("createPageInputChooseFGallery")}</Label>
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {designs.slice(0, 9).map((design: any) => (
                    <div
                      key={design.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedDesign?.id === design.id ? 'border-primary' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setSelectedDesign(design);
                        setUploadedFile(null); // Clear uploaded file when selecting from gallery
                      }}
                    >
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="w-full h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">
                          €{design.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div>
                <Label htmlFor="custom-text">{t("createPageInputAddText")}</Label>
                <Input
                  id="custom-text"
                  placeholder={t("createPageInputAddTextPlaceholder")}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                />
              </div>

              {/* Color Selection */}
              {customizationOptions.colors && (
                <div>
                  <Label>{t("createPageInputCustomColor")}</Label>
                  <div className="flex space-x-2">
                    {customizationOptions.colors.map((color: string) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full border-2 transition-colors ${
                          selectedColor === color || color === 'white' ? 'border-gray-400' : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color === 'white' ? '#ffffff' : color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {customizationOptions.sizes && (
                <div>
                  <Label htmlFor="size-select">{t("createPageInputCustomSize")}</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger id="size-select">
                      <SelectValue placeholder={t("createPageInputCustomSizePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {customizationOptions.sizes.map((size: string) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                {t("createPagePreviewTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductCustomizer
                product={selectedProduct}
                design={selectedDesign}
                uploadedFile={uploadedFile}
                customText={customText}
                color={selectedColor}
                size={selectedSize}
              />

              {selectedProduct && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{selectedProduct.name}</span>
                    <span className="text-2xl font-bold text-primary">
                      €{totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* <div className="text-sm text-gray-600 space-y-1">
                    <p>Production time: 2-3 business days</p>
                    <p>Shipping: 3-5 business days</p>
                  </div> */}

                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                    disabled={!selectedProduct || (!selectedDesign && !uploadedFile)}
                  >
                    {t("productCardAddToCartCTA")} - €{totalPrice.toFixed(2)}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
