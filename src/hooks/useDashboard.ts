"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { WidgetData } from '@/lib/types/dashboard';

export const useDashboard = () => {
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch widgets from the API
  const fetchWidgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/widgets');
      
      if (!response.ok) {
        throw new Error('Failed to fetch widgets');
      }
      
      const data = await response.json();
      
      // Transform the data from the API to match the WidgetData interface
      const transformedWidgets: WidgetData[] = data.widgets.map((widget: any) => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        width: widget.width,
        height: widget.height,
        position: {
          x: widget.positionX,
          y: widget.positionY,
        },
        settings: widget.settings ? JSON.parse(widget.settings) : {},
      }));
      
      setWidgets(transformedWidgets);
    } catch (err) {
      console.error('Error fetching widgets:', err);
      setError('Failed to load dashboard widgets');
      toast.error('Failed to load dashboard widgets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save widgets to the API
  const saveWidgets = useCallback(async (updatedWidgets: WidgetData[]) => {
    try {
      // Transform the widgets to match the API expectations
      const transformedWidgets = updatedWidgets.map(widget => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        width: widget.width,
        height: widget.height,
        positionX: widget.position.x,
        positionY: widget.position.y,
        settings: JSON.stringify(widget.settings),
      }));
      
      const response = await fetch('/api/dashboard/widgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ widgets: transformedWidgets }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save widgets');
      }
      
      setWidgets(updatedWidgets);
      toast.success('Dashboard layout saved');
    } catch (err) {
      console.error('Error saving widgets:', err);
      toast.error('Failed to save dashboard layout');
    }
  }, []);

  // Add a new widget
  const addWidget = useCallback(async (widget: Omit<WidgetData, 'id'>) => {
    try {
      const response = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: widget.type,
          title: widget.title,
          width: widget.width,
          height: widget.height,
          positionX: widget.position.x,
          positionY: widget.position.y,
          settings: JSON.stringify(widget.settings),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add widget');
      }
      
      const data = await response.json();
      
      const newWidget: WidgetData = {
        id: data.id,
        type: widget.type,
        title: widget.title,
        width: widget.width,
        height: widget.height,
        position: widget.position,
        settings: widget.settings,
      };
      
      setWidgets(prev => [...prev, newWidget]);
      toast.success('Widget added to dashboard');
      
      return newWidget;
    } catch (err) {
      console.error('Error adding widget:', err);
      toast.error('Failed to add widget to dashboard');
      return null;
    }
  }, []);

  // Remove a widget
  const removeWidget = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/widgets?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove widget');
      }
      
      setWidgets(prev => prev.filter(widget => widget.id !== id));
      toast.success('Widget removed from dashboard');
      return true;
    } catch (err) {
      console.error('Error removing widget:', err);
      toast.error('Failed to remove widget from dashboard');
      return false;
    }
  }, []);

  // Update widget layout
  const updateLayout = useCallback((updatedWidgets: WidgetData[]) => {
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  }, [saveWidgets]);

  // Load widgets on mount
  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  return {
    widgets,
    isLoading,
    error,
    fetchWidgets,
    addWidget,
    removeWidget,
    updateLayout,
  };
}; 