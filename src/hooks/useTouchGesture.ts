"use client";

import { useRef, useEffect, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export function useTouchGesture(options: TouchGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinchIn,
    onPinchOut,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;
  
  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchEndRef = useRef<TouchPosition | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const initialPinchDistanceRef = useRef<number | null>(null);
  
  // Reset touch state
  const resetTouchState = () => {
    touchStartRef.current = null;
    touchEndRef.current = null;
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  // Calculate distance between two touch points
  const getDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - potential swipe, tap, or long press
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      
      // Set up long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress();
          resetTouchState();
        }, longPressDelay);
      }
    } else if (e.touches.length === 2 && (onPinchIn || onPinchOut)) {
      // Two touches - potential pinch
      initialPinchDistanceRef.current = getDistance(e.touches);
    }
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if finger moves significantly
    if (
      longPressTimerRef.current &&
      touchStartRef.current &&
      e.touches.length === 1
    ) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartRef.current.y);
      
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
    
    // Handle pinch
    if (
      e.touches.length === 2 &&
      initialPinchDistanceRef.current &&
      (onPinchIn || onPinchOut)
    ) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialPinchDistanceRef.current;
      
      if (scale < 1 && onPinchIn) {
        onPinchIn(scale);
      } else if (scale > 1 && onPinchOut) {
        onPinchOut(scale);
      }
    }
  };
  
  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Handle swipe and tap
    if (touchStartRef.current) {
      const touch = e.changedTouches[0];
      touchEndRef.current = { x: touch.clientX, y: touch.clientY };
      
      const dx = touchEndRef.current.x - touchStartRef.current.x;
      const dy = touchEndRef.current.y - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      
      // Detect swipe
      if (Math.max(absDx, absDy) > swipeThreshold) {
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (dx < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (dy > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (dy < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      } else if (absDx < 10 && absDy < 10) {
        // Detect tap or double tap
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTimeRef.current;
        
        if (onDoubleTap && timeSinceLastTap < doubleTapDelay) {
          onDoubleTap();
          lastTapTimeRef.current = 0; // Reset to prevent triple tap counting as another double tap
        } else if (onTap) {
          onTap();
          lastTapTimeRef.current = now;
        }
      }
    }
    
    // Reset touch state
    resetTouchState();
    initialPinchDistanceRef.current = null;
  };
  
  // Handle touch cancel
  const handleTouchCancel = () => {
    resetTouchState();
    initialPinchDistanceRef.current = null;
  };
  
  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
} 