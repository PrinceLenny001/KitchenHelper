"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { WidgetData, WidgetType } from '@/lib/types/dashboard';
import { fetchWithErrorHandling } from '@/lib/utils/fetch';

export function useDashboard() {
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithErrorHandling('/api/dashboard/widgets');
      
      if (!data || !data.widgets) {
        throw new Error('Invalid response format');
      }
      
      // Transform the data to match our WidgetData interface
      const transformedWidgets: WidgetData[] = data.widgets.map((widget: any) => ({
        id: widget.id,
        type: widget.type as WidgetType,
        title: widget.title,
        width: widget.width,
        height: widget.height,
        x: widget.positionX,
        y: widget.positionY,
        settings: widget.settings ? JSON.parse(widget.settings) : {},
      }));
      
      setWidgets(transformedWidgets);
      setError(null);
    } catch (err) {
      console.error('Error fetching widgets:', err);
      setError('Failed to load dashboard widgets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addWidget = async (widget: Omit<WidgetData, 'id'>) => {
    try {
      const newWidget = await fetchWithErrorHandling('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: widget.type,
          title: widget.title,
          width: widget.width,
          height: widget.height,
          positionX: widget.x,
          positionY: widget.y,
          settings: JSON.stringify(widget.settings),
        }),
      });
      
      if (!newWidget) {
        throw new Error('Invalid response format');
      }
      
      // Transform the response to match our WidgetData interface
      const transformedWidget: WidgetData = {
        id: newWidget.id,
        type: newWidget.type as WidgetType,
        title: newWidget.title,
        width: newWidget.width,
        height: newWidget.height,
        x: newWidget.positionX,
        y: newWidget.positionY,
        settings: newWidget.settings ? JSON.parse(newWidget.settings) : {},
      };
      
      setWidgets([...widgets, transformedWidget]);
      toast.success('Widget added successfully');
    } catch (err) {
      console.error('Error adding widget:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add widget');
      throw err;
    }
  };

  const removeWidget = async (id: string) => {
    try {
      await fetchWithErrorHandling(`/api/dashboard/widgets?id=${id}`, {
        method: 'DELETE',
      });
      
      setWidgets(widgets.filter(widget => widget.id !== id));
      toast.success('Widget removed successfully');
    } catch (err) {
      console.error('Error removing widget:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to remove widget');
      throw err;
    }
  };

  const updateLayout = async (updatedWidgets: WidgetData[]) => {
    try {
      // Transform the widgets to match the API's expected format
      const transformedWidgets = updatedWidgets.map(widget => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        width: widget.width,
        height: widget.height,
        positionX: widget.x,
        positionY: widget.y,
        settings: JSON.stringify(widget.settings),
      }));
      
      await fetchWithErrorHandling('/api/dashboard/widgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          widgets: transformedWidgets,
        }),
      });
      
      setWidgets(updatedWidgets);
    } catch (err) {
      console.error('Error updating layout:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update layout');
      throw err;
    }
  };
  
  const saveWidgets = (updatedWidgets: WidgetData[]) => {
    setWidgets(updatedWidgets);
    updateLayout(updatedWidgets).catch(err => {
      console.error('Error saving widgets:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save widget changes');
    });
  };

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
    saveWidgets,
  };
} 