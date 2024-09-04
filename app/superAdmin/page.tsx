'use client'

import React, { useState } from 'react';
import { Button, Flex, Card, Heading, Text } from '@radix-ui/themes';
import { FaBuilding, FaUsers, FaChartBar, FaCog, FaDatabase, FaFileContract } from 'react-icons/fa';
import TenantManagement from './components/tenantManagement';
import CommercialProposals from './components/commercialProposal';
const SuperAdminPage = () => {
  const [activeTab, setActiveTab] = useState('tenants');

  const menuItems = [
    { id: 'tenants', label: 'Tenant Management', icon: FaBuilding },
    { id: 'commercialProposals', label: 'Commercial Proposals', icon: FaFileContract },
    { id: 'users', label: 'Global User Management', icon: FaUsers },
    { id: 'analytics', label: 'System Analytics', icon: FaChartBar },
    { id: 'settings', label: 'System Settings', icon: FaCog },
    { id: 'database', label: 'Database Management', icon: FaDatabase },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      <Flex gap="4">
        {/* Side Menu */}
        <Card className="w-64 h-[calc(100vh-200px)]">
          <Flex direction="column" gap="2">
            {menuItems.map((item) => (
              <Button 
                key={item.id}
                variant={activeTab === item.id ? 'solid' : 'ghost'} 
                onClick={() => setActiveTab(item.id)}
                className="justify-start"
              >
                <item.icon className="mr-2" /> {item.label}
              </Button>
            ))}
          </Flex>
        </Card>

        {/* Main Content */}
        <Card className="flex-1 p-6">
          {activeTab === 'tenants' && <TenantManagement />}
          {activeTab === 'commercialProposals' && <CommercialProposals />}
          {/* ... other tab content ... */}
        </Card>
      </Flex>
    </div>
  );
};

export default SuperAdminPage;
