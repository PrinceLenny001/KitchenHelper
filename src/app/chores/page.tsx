"use client";

import React from 'react';
import { ChoreList } from '@/components/chores/ChoreList';
import { ChoreProvider } from '@/lib/context/ChoreContext';
import { FamilyMemberProvider } from '@/lib/context/FamilyMemberContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ChoresPage() {
  return (
    <FamilyMemberProvider>
      <ChoreProvider>
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Chores & Routines"
            description="Manage household tasks and recurring routines"
          />
          
          <Tabs defaultValue="chores" className="mt-6">
            <TabsList className="mb-6">
              <TabsTrigger value="chores">Chores</TabsTrigger>
              <TabsTrigger value="routines">Routines</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chores">
              <ChoreList showCompleted={false} />
            </TabsContent>
            
            <TabsContent value="routines">
              <div className="p-4 text-center">
                <p className="text-gray-500">Routines feature coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <ChoreList showCompleted={true} />
            </TabsContent>
          </Tabs>
        </div>
        
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ChoreProvider>
    </FamilyMemberProvider>
  );
} 