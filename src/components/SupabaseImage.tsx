'use client';

import { useState, useEffect } from 'react';
import { imageService } from '@/lib/image-service';

interface SupabaseImageProps {
  filePath: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  enableModal?: boolean; // Whether to enable the modal onclick functionality (default: true)
  onModalChange?: (isOpen: boolean) => void; // Callback when modal state changes
}

export default function SupabaseImage({
  filePath,
  alt,
  className,
  fallbackSrc = "/fback.png",
  enableModal = true,
  onModalChange
}: SupabaseImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      if (!filePath) {
        setImageSrc(fallbackSrc);
        return;
      }

      // Get the optimal URL from the service
      const optimalUrl = await imageService.getOptimalUrl(filePath);
      if (optimalUrl) {
        setImageSrc(optimalUrl);
      } else {
        setImageSrc(fallbackSrc);
      }
    };

    processImage();
  }, [filePath, fallbackSrc]);

  const handleError = () => {
    setImageSrc(fallbackSrc);
  };

  const handleImageClick = () => {
    if (enableModal) {
      setIsModalOpen(true);
      onModalChange?.(true); // Notify parent about modal state change
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
        onModalChange?.(false); // Notify parent about modal state change
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onModalChange]);

  return (
    <>
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onClick={(e) => {
          e.stopPropagation(); // Prevent the click from affecting parent hover effects
          handleImageClick();
        }}
        style={{ cursor: enableModal ? 'pointer' : 'default' }}
      />

      {/* Modal for larger image view */}
      {enableModal && isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsModalOpen(false);
            onModalChange?.(false); // Notify parent about modal state change
          }}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the modal content
          >
            <img
              src={imageSrc}
              alt={alt}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition"
              onClick={() => {
                setIsModalOpen(false);
                onModalChange?.(false); // Notify parent about modal state change
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}