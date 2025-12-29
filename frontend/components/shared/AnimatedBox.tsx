"use client";

import { Box, BoxProps } from "@mui/material";
import { useScrollAnimation } from "@/lib/hooks/useScrollAnimation";

interface AnimatedBoxProps extends BoxProps {
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scale";
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function AnimatedBox({
  animation = "fadeIn",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  children,
  sx,
  ...props
}: AnimatedBoxProps) {
  const { ref, isVisible } = useScrollAnimation({
    threshold,
    triggerOnce: true,
  });

  const getAnimationStyles = () => {
    const baseStyles = {
      transition: `all ${duration}s ease-out ${delay}s`,
      opacity: isVisible ? 1 : 0,
    };

    switch (animation) {
      case "fadeIn":
        return {
          ...baseStyles,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
        };
      case "slideUp":
        return {
          ...baseStyles,
          transform: isVisible ? "translateY(0)" : "translateY(50px)",
        };
      case "slideLeft":
        return {
          ...baseStyles,
          transform: isVisible ? "translateX(0)" : "translateX(-50px)",
        };
      case "slideRight":
        return {
          ...baseStyles,
          transform: isVisible ? "translateX(0)" : "translateX(50px)",
        };
      case "scale":
        return {
          ...baseStyles,
          transform: isVisible ? "scale(1)" : "scale(0.9)",
        };
      default:
        return baseStyles;
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        ...getAnimationStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

