import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';

interface ProductCustomizerProps {
  product?: {
    id: number;
    name: string;
    basePrice: string;
    imageUrl?: string;
    customizationOptions?: any;
  };
  design?: {
    id: number;
    title: string;
    imageUrl: string;
    price: string;
  };
  uploadedFile?: File | null;
  customText?: string;
  color?: string;
  size?: string;
}

export default function ProductCustomizer({
  product,
  design,
  uploadedFile,
  customText,
  color,
  size,
}: ProductCustomizerProps) {

const { t, i18n } = useTranslation();  
const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setPreviewImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewImageUrl(null);
    }
  }, [uploadedFile]);

  if (!product) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center h-64 flex items-center justify-center">
        <div>
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-gray-500">{t("createPagePreviewTagline")}</p>
        </div>
      </div>
    );
  }

  const basePrice = parseFloat(product.basePrice);
  const designPrice = design ? parseFloat(design.price) : 0;
  const totalPrice = basePrice + designPrice;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Product Preview */}
      <div className="relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center p-8">
          {/* Base Product */}
          <div className="relative max-w-full max-h-full">
            <img
              src={product.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"}
              alt={product.name}
              className="w-full h-64 object-contain rounded-lg"
              style={{
                filter: color && color !== '#000000' && color !== 'black' 
                  ? `hue-rotate(${getHueRotation(color)}deg) saturate(1.2)` 
                  : 'none'
              }}
            />
            
            {/* Design Overlay */}
            {(design || previewImageUrl) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative bg-white/90 rounded p-4 max-w-[60%] max-h-[60%] flex items-center justify-center">
                  <img
                    src={previewImageUrl || design?.imageUrl}
                    alt="Custom design"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}
            
            {/* Custom Text Overlay */}
            {customText && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div 
                  className="px-3 py-1 rounded font-medium text-sm shadow-lg"
                  style={{ 
                    backgroundColor: color === 'white' ? '#000000' : color || '#000000',
                    color: color === 'white' || color === '#ffffff' ? '#000000' : '#ffffff'
                  }}
                >
                  {customText}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customization Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {size && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur">
              Size: {size}
            </Badge>
          )}
          {color && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                style={{ backgroundColor: color }}
              />
              Color
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{product.name}</h3>
            {design && (
              <p className="text-sm text-gray-600 mt-1">
                with "{design.title}" {t("createPageCustomDesignTxt")}
              </p>
            )}
            {uploadedFile && (
              <p className="text-sm text-gray-600 mt-1">
                {t("createPageCustomFile")}: {uploadedFile.name}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${totalPrice.toFixed(2)}
            </div>
            {designPrice > 0 && (
              <div className="text-sm text-gray-500">
                {t("createPageCustomProductTxt")}: ${basePrice.toFixed(2)} + {t("createPageCustomDesignTxt")}: ${designPrice.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Customization Summary */}
        {(customText || size || color || design || uploadedFile) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">{t("createPagePreviewCustomizationTitle")}:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {design && <li>• {t("createPageCustomDesign")}: {design.title} (+${design.price})</li>}
              {uploadedFile && <li>• {t("createPageCustomFile")}: {uploadedFile.name}</li>}
              {customText && <li>• {t("createPageCustomText")}: "{customText}"</li>}
              {size && <li>• {t("createPageCustomSize")}: {size}</li>}
              {color && <li>• {t("createPageCustomColor")}: {color}</li>}
            </ul>
          </div>
        )}

        {/* Production Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex justify-between">
            <span>{t("createPageCustomProductionTime")}:</span>
            <span>2-3 {t("createPagePreviewProcessDuration")}</span>
          </p>
          <p className="flex justify-between">
            <span>{t("createPageCustomShipping")}:</span>
            <span>3-5 {t("createPagePreviewProcessDuration")}</span>
          </p>
          <p className="flex justify-between">
            <span>{t("createPageCustomTotalDelivery")}:</span>
            <span className="font-medium">5-8 {t("createPagePreviewProcessDuration")}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert color to hue rotation
function getHueRotation(color: string): number {
  // Simple color to hue mapping for basic colors
  const colorMap: { [key: string]: number } = {
    red: 0,
    orange: 30,
    yellow: 60,
    green: 120,
    blue: 240,
    purple: 270,
    pink: 320,
    white: 0,
    black: 0,
  };
  
  return colorMap[color] || 0;
}
