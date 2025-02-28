"use client";

import React from 'react';
import { VerticalLayout } from '@/components/layout/VerticalLayout';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { TouchButton } from '@/components/ui/TouchButton';
import { TouchSlider } from '@/components/ui/TouchSlider';
import { TouchFeedback } from '@/components/ui/TouchFeedback';
import { useTouchGesture } from '@/hooks/useTouchGesture';
import { AccessibilityControls } from '@/components/accessibility/AccessibilityControls';
import { toast } from 'react-toastify';
import { Home } from 'lucide-react';

export default function HomePage() {
  // Touch gesture example
  const { touchHandlers } = useTouchGesture({
    onSwipeLeft: () => toast.info('Swiped left'),
    onSwipeRight: () => toast.info('Swiped right'),
    onSwipeUp: () => toast.info('Swiped up'),
    onSwipeDown: () => toast.info('Swiped down'),
    onTap: () => toast.info('Tapped'),
    onDoubleTap: () => toast.info('Double tapped'),
    onLongPress: () => toast.info('Long pressed'),
  });
  
  return (
    <VerticalLayout
      header={<Header />}
      footer={<BottomNavigation />}
    >
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <h1 className="text-4xl font-bold text-center">Family Calendar</h1>
        <p className="text-xl text-center text-muted-foreground">
          A family calendar application for a 32" touchscreen display
        </p>
        
        <div className="w-full max-w-md space-y-6 p-6 border border-border rounded-lg">
          <h2 className="text-2xl font-semibold">Touch-Optimized Components</h2>
          
          {/* Touch Button examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <TouchButton size="lg" variant="primary">
                Primary
              </TouchButton>
              <TouchButton size="lg" variant="secondary">
                Secondary
              </TouchButton>
              <TouchButton size="lg" variant="outline">
                Outline
              </TouchButton>
              <TouchButton 
                size="lg" 
                variant="primary"
                icon={<Home size={24} />}
              >
                With Icon
              </TouchButton>
            </div>
          </div>
          
          {/* Touch Slider example */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Slider</h3>
            <TouchSlider
              min={0}
              max={100}
              defaultValue={50}
              label="Volume"
            />
          </div>
          
          {/* Touch Feedback example */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Touch Feedback</h3>
            <TouchFeedback className="p-6 border border-border rounded-lg text-center">
              <p>Tap me to see feedback effect</p>
            </TouchFeedback>
          </div>
          
          {/* Touch Gesture example */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Touch Gestures</h3>
            <div 
              className="p-6 border border-border rounded-lg text-center bg-primary/5"
              {...touchHandlers}
            >
              <p>Try swiping, tapping, double-tapping, or long-pressing here</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Accessibility Controls */}
      <AccessibilityControls />
    </VerticalLayout>
  );
}
