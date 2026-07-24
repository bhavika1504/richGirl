import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, Heart } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  badge?: string;
  selectedColor?: string;
  colorImageMap?: Record<string, string>; // colorLabel -> front image URL
}

export function ImageGallery({ images, badge, selectedColor, colorImageMap }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Compose display images:
  // [0] = colour-specific front image (if available), otherwise images[0]
  // [1+] = global side/back images from images[1+]
  const composedImages = (() => {
    const sideBackImages = images.slice(1); // indices 1+ are side/back
    const frontImage =
      selectedColor && colorImageMap && colorImageMap[selectedColor]
        ? colorImageMap[selectedColor]
        : images[0];
    return [frontImage, ...sideBackImages].filter(Boolean);
  })();

  // When colour changes, always show the front image (index 0)
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  const displayImages = composedImages.length > 0 ? composedImages : images;

  return (
    <div className="lg:sticky lg:top-24">
      {/* Mobile Carousel */}
      <div className="lg:hidden relative">
        <div className="relative overflow-hidden shadow-sm border border-gray-100" style={{ aspectRatio: '3/4', borderRadius: '20px' }}>
          <motion.img
            key={`${selectedColor}-${selectedImage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            src={displayImages[selectedImage]}
            alt="Product"
            className="w-full h-full object-cover"
            style={{ backgroundColor: 'var(--brand-alt-bg)' }}
          />

          {/* Badge */}
          {badge && (
            <div
              className="absolute top-4 left-4 px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--brand-cta-green)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '10px'
              }}
            >
              {badge}
            </div>
          )}

          {/* Wishlist - Mobile */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <Heart
              className="w-5 h-5"
              style={{
                color: 'var(--brand-dark-text)',
                fill: isWishlisted ? 'var(--brand-cta-green)' : 'none'
              }}
            />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                style={{
                  width: selectedImage === index ? '8px' : '6px',
                  height: selectedImage === index ? '8px' : '6px',
                  borderRadius: '50%',
                  backgroundColor: selectedImage === index ? 'var(--brand-cta-green)' : 'var(--brand-border)',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Gallery */}
      <div className="hidden lg:block">
        {/* Primary Image */}
        <div className="relative group">
          <motion.img
            key={`${selectedColor}-${selectedImage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            src={displayImages[selectedImage]}
            alt="Product"
            className="w-full object-cover transition-transform duration-300 group-hover:scale-103"
            style={{
              aspectRatio: '3/4',
              borderRadius: '16px',
              backgroundColor: 'var(--brand-alt-bg)'
            }}
          />

          {/* Badge */}
          {badge && (
            <div
              className="absolute top-4 left-4 px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--brand-cta-green)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '10px'
              }}
            >
              {badge}
            </div>
          )}

          {/* Zoom Icon */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative group/zoom">
              <ZoomIn className="w-5 h-5" style={{ color: 'var(--brand-dark-text)' }} />
              <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-black/75 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/zoom:opacity-100 transition-opacity"
                style={{ fontFamily: 'var(--font-body)', fontSize: '10px' }}>
                Click to zoom
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-2.5 mt-3">
          {displayImages.map((image, index) => (
            <button
              key={`${selectedColor}-${index}`}
              onClick={() => setSelectedImage(index)}
              className="overflow-hidden transition-all"
              style={{
                width: '72px',
                height: '90px',
                borderRadius: '10px',
                border: selectedImage === index ? '2px solid var(--brand-cta-green)' : '0.5px solid var(--brand-border)',
                opacity: selectedImage === index ? 1 : 0.7
              }}
            >
              <img
                src={image}
                alt={index === 0 ? 'Front view' : `View ${index + 1}`}
                className="w-full h-full object-cover hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
