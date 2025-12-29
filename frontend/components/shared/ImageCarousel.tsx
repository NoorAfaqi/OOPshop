"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  alpha,
  Typography,
  Button,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  image?: string;
  gradient?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface ImageCarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  interval?: number;
  height?: number | string;
}

export default function ImageCarousel({
  slides,
  autoPlay = true,
  interval = 5000,
  height = 500,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      if (!isTransitioningRef.current) {
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % slides.length);
          setIsTransitioning(false);
          isTransitioningRef.current = false;
        }, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, 300);
  };

  const goToPrevious = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, 300);
  };

  const goToNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, 300);
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 400, md: height },
        overflow: "hidden",
        borderRadius: { xs: 0, md: 3 },
        mb: 4,
      }}
    >
      {/* Slide Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: currentSlide.gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundImage: currentSlide.image
            ? `url(${currentSlide.image})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isTransitioning ? 0.7 : 1,
          transform: isTransitioning ? "scale(1.02)" : "scale(1)",
        }}
      >
        {/* Overlay for better text readability */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: currentSlide.image
              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)"
              : "transparent",
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            px: { xs: 3, md: 6 },
            maxWidth: "800px",
            transition: "all 0.5s ease-out",
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(20px)" : "translateY(0)",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              fontWeight: 600,
              mb: 2,
              lineHeight: 1.3,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {currentSlide.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              mb: 4,
              opacity: 0.95,
              fontWeight: 400,
              textShadow: "0 1px 5px rgba(0,0,0,0.2)",
            }}
          >
            {currentSlide.description}
          </Typography>
          {currentSlide.buttonText && (
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                if (currentSlide.buttonLink) {
                  router.push(currentSlide.buttonLink);
                }
              }}
              sx={{
                bgcolor: "white",
                color: "#667eea",
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                "&:hover": {
                  bgcolor: "#f5f5f5",
                  transform: "translateY(-2px)",
                  boxShadow: "0 15px 50px rgba(0,0,0,0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {currentSlide.buttonText}
            </Button>
          )}
        </Box>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <IconButton
              onClick={goToPrevious}
              sx={{
                position: "absolute",
                left: { xs: 8, md: 16 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                bgcolor: alpha("#fff", 0.2),
                color: "white",
                "&:hover": {
                  bgcolor: alpha("#fff", 0.3),
                },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton
              onClick={goToNext}
              sx={{
                position: "absolute",
                right: { xs: 8, md: 16 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                bgcolor: alpha("#fff", 0.2),
                color: "white",
                "&:hover": {
                  bgcolor: alpha("#fff", 0.3),
                },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}

        {/* Dots Indicator */}
        {slides.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 3,
              display: "flex",
              gap: 1,
            }}
          >
            {slides.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: currentIndex === index ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: currentIndex === index ? "white" : alpha("#fff", 0.5),
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha("#fff", 0.8),
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

