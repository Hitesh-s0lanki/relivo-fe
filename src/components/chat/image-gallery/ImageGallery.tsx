"use client";

import "react-photo-view/dist/react-photo-view.css";

import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";

import { ALLOWED_ASPECT_RATIOS } from "@/components/chat/media/aspectRatios";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  keyProp: string;
  disableDownload?: boolean;
  isThumbnailMode?: boolean;
  aspectRatio?: string;
  aspectRatios?: string[];
  slugs?: Array<string | undefined>;
}

const GALLERY_ROW_HEIGHT_PX = 220;

function skeletonWidthFor(aspect: string | undefined): number {
  if (!aspect || !ALLOWED_ASPECT_RATIOS.has(aspect)) {
    return GALLERY_ROW_HEIGHT_PX;
  }

  const [width, height] = aspect.split(":").map(Number);
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return GALLERY_ROW_HEIGHT_PX;
  }

  return Math.round(GALLERY_ROW_HEIGHT_PX * (width / height));
}

type GalleryImageProps = React.HTMLAttributes<HTMLDivElement> & {
  url: string;
  alt: string;
  isThumbnailMode: boolean;
  priority: boolean;
  skeletonWidth: number;
  children?: React.ReactNode;
};

const GalleryImage = React.forwardRef<HTMLDivElement, GalleryImageProps>(
  function GalleryImage(
    {
      url,
      alt,
      isThumbnailMode,
      skeletonWidth,
      children,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const [loaded, setLoaded] = React.useState(false);
    const imageRef = React.useRef<HTMLImageElement | null>(null);
    const wrapperStyle = isThumbnailMode
      ? undefined
      : { height: GALLERY_ROW_HEIGHT_PX, width: skeletonWidth };

    React.useEffect(() => {
      let cancelled = false;
      const check = () => {
        if (cancelled) return;
        const image = imageRef.current;
        if (image?.complete && image.naturalWidth > 0) {
          setLoaded(true);
          return;
        }
        requestAnimationFrame(() => {
          if (cancelled) return;
          const later = imageRef.current;
          if (later?.complete && later.naturalWidth > 0) setLoaded(true);
        });
      };

      check();
      return () => {
        cancelled = true;
      };
    }, [url]);

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "group relative shrink-0 cursor-pointer overflow-hidden rounded-[18px] border border-zinc-200 bg-zinc-100 transition-all duration-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900",
          isThumbnailMode ? "size-32 sm:size-40" : "max-w-full",
          className
        )}
        style={{ ...wrapperStyle, ...style }}
      >
        {!loaded && (
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900"
          >
            <span className="absolute inset-y-0 -left-1/3 w-1/3 animate-[shimmer_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-zinc-500/10 to-transparent" />
          </div>
        )}
        <img
          ref={imageRef}
          alt={alt}
          className={cn(
            "relative object-cover transition-transform duration-300 group-hover:scale-105",
            isThumbnailMode ? "size-full" : "h-full w-auto max-w-full"
          )}
          onError={() => setLoaded(true)}
          onLoad={() => setLoaded(true)}
          src={url}
        />
        {children}
      </div>
    );
  }
);

export function ImageGallery({
  images,
  keyProp,
  disableDownload = false,
  isThumbnailMode = false,
  aspectRatio,
  aspectRatios,
  slugs,
}: ImageGalleryProps) {
  const resolveSkeletonWidth = (index: number): number =>
    skeletonWidthFor(aspectRatios?.[index] ?? aspectRatio);

  const handleDownloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Image download failed");

      const blob = await response.blob();
      const date = new Date().toISOString().split("T")[0];
      const filename = `Relivo-Image-${date}-${index + 1}.png`;
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Image downloaded successfully");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  if (!images.length) return null;

  return (
    <PhotoProvider
      maskOpacity={0.5}
      toolbarRender={({ index, images: photoImages, onIndexChange }) => (
        <div className="flex items-center gap-2">
          {!disableDownload && (
            <Button
              className="text-white backdrop-blur-sm hover:bg-white/15"
              onClick={(event) => {
                event.stopPropagation();
                const currentImage = images[index];
                if (currentImage) {
                  void handleDownloadImage(currentImage, index);
                }
              }}
              size="sm"
              title="Download image"
              variant="ghost"
            >
              <Download size={18} />
            </Button>
          )}

          {photoImages.length > 1 && (
            <>
              {index > 0 && (
                <Button
                  className="text-white backdrop-blur-sm hover:bg-white/15"
                  onClick={() => onIndexChange(index - 1)}
                  size="sm"
                  title="Previous"
                  variant="ghost"
                >
                  <ChevronLeft size={20} />
                </Button>
              )}
              {index < photoImages.length - 1 && (
                <Button
                  className="text-white backdrop-blur-sm hover:bg-white/15"
                  onClick={() => onIndexChange(index + 1)}
                  size="sm"
                  title="Next"
                  variant="ghost"
                >
                  <ChevronRight size={20} />
                </Button>
              )}
            </>
          )}
        </div>
      )}
    >
      <div
        className={cn("flex flex-wrap gap-3", isThumbnailMode && "justify-end")}
      >
        {images.map((url, index) => (
          <PhotoView key={`${keyProp}-image-${index}`} src={url}>
            <GalleryImage
              alt={`Attachment image ${index + 1}`}
              isThumbnailMode={isThumbnailMode}
              priority={index < 2}
              skeletonWidth={resolveSkeletonWidth(index)}
              url={url}
            >
              {!isThumbnailMode && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              )}
              {images.length > 1 && !isThumbnailMode ? (
                <div className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-white/85 text-xs font-semibold text-zinc-900 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 dark:bg-zinc-950/85 dark:text-zinc-50">
                  {index + 1}
                </div>
              ) : null}
              {!isThumbnailMode && slugs?.[index] ? (
                <div className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-1 text-xs font-medium text-zinc-900 backdrop-blur-sm dark:bg-zinc-950/85 dark:text-zinc-50">
                  @{slugs[index]}
                </div>
              ) : null}
            </GalleryImage>
          </PhotoView>
        ))}
      </div>
    </PhotoProvider>
  );
}
