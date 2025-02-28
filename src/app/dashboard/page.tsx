"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useDashboard } from "@/hooks/useDashboard";
import { WidgetType } from "@/lib/types/dashboard";
import { WidgetRegistry } from "@/lib/widgets/registry";
import { LucideIcon } from "lucide-react";

export default function DashboardPage() {
  const { widgets, isLoading, error, addWidget, removeWidget, updateLayout } = useDashboard();
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  
  const handleAddWidget = async (type: WidgetType) => {
    setIsAddingWidget(true);
    try {
      const widgetDef = WidgetRegistry.getInstance().getWidget(type);
      if (!widgetDef) {
        toast.error(`Widget type ${type} not found`);
        return;
      }
      
      const defaultSettings = widgetDef.defaultSettings || {};
      
      await addWidget({
        type,
        title: widgetDef.name,
        width: widgetDef.defaultWidth,
        height: widgetDef.defaultHeight,
        x: 0,
        y: 0,
        settings: defaultSettings,
      });
      
      toast.success(`Added ${widgetDef.name} widget`);
    } catch (err) {
      console.error("Error adding widget:", err);
      toast.error("Failed to add widget");
    } finally {
      setIsAddingWidget(false);
    }
  };
  
  const handleRemoveWidget = async (id: string) => {
    try {
      await removeWidget(id);
      toast.success("Widget removed");
    } catch (err) {
      console.error("Error removing widget:", err);
      toast.error("Failed to remove widget");
    }
  };
  
  const handleUpdateLayout = async (updatedWidgets: any[]) => {
    try {
      await updateLayout(updatedWidgets);
    } catch (err) {
      console.error("Error updating layout:", err);
      toast.error("Failed to update layout");
    }
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setIsAddingWidget(!isAddingWidget)}
              disabled={isAddingWidget}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isAddingWidget ? "Adding..." : "Add Widget"}
            </button>
            
            {isAddingWidget && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Widget Type</h3>
                  <div className="space-y-1">
                    {WidgetRegistry.getInstance().getAllWidgets().map((widget) => {
                      const IconComponent = widget.icon as LucideIcon;
                      return (
                        <button
                          key={widget.type}
                          onClick={() => handleAddWidget(widget.type)}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center">
                            <IconComponent className="w-4 h-4 mr-2" />
                            <span>{widget.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{widget.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <DashboardLayout
        widgets={widgets}
        isLoading={isLoading}
        onRemoveWidget={handleRemoveWidget}
        onUpdateLayout={handleUpdateLayout}
      />
    </div>
  );
} 