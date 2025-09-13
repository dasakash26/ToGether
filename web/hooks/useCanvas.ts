import { useEffect, useCallback, useState } from "react";

interface UseCanvasAnimationProps {
  drawFunction: () => void;
  dependencies?: React.DependencyList;
}

export function useCanvasAnimation({
  drawFunction,
  dependencies = [],
}: UseCanvasAnimationProps) {
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      drawFunction();
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [drawFunction, ...dependencies]);
}

export function useImageLoader(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      setImage(img);
      setLoading(false);
    };

    img.onerror = () => {
      setError("Failed to load image");
      setLoading(false);
    };

    img.src = src;

    return () => {
      setImage(null);
      setLoading(true);
      setError(null);
    };
  }, [src]);

  return { image, loading, error };
}
