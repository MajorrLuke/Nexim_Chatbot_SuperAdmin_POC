'use client'

import React, { useState } from 'react';
import { Button, Flex, Card, Heading, Text, Section } from '@radix-ui/themes';
import { FaBuilding, FaUsers, FaChartBar, FaCog, FaDatabase, FaFileContract } from 'react-icons/fa';
import TenantManagement from './components/tenantManagement';
import CommercialProposals from './components/commercialProposal';
import TenantUserManagement from './components/tenantUserManagement';
import UserButton from '@/components/user-button';
import ThemeToggle from '@/components/themeToggle';
import ThemeLogo from '@/components/image';

const SuperAdminPage = () => {
  const [activeTab, setActiveTab] = useState('tenants');

  const menuItems = [
    { id: 'tenants', label: 'Tenant Management', icon: FaBuilding },
    { id: 'users', label: 'Tenant User Management', icon: FaUsers },
    { id: 'commercialProposals', label: 'Commercial Proposals', icon: FaFileContract },
    { id: 'analytics', label: 'System Analytics', icon: FaChartBar },
    { id: 'settings', label: 'System Settings', icon: FaCog },
    { id: 'database', label: 'Database Management', icon: FaDatabase },
  ];

  return (
    <>
      <Section className='h-screen pt-0 mt-0'>
        <Flex>
          {/* Side Menu */}
          <Section className="w-1/6 h-screen pt-10 border-r-2 border-gray-300/20 bg-white dark:bg-black">
          <ThemeLogo  className='justify-center mr-8 pb-4'/>
          <div className="w-full flex justify-center items-center space-x-2 pb-10">
            <UserButton />
            <ThemeToggle />
          </div>
            <Flex direction="column" gap="2" className='p-4'>
              {menuItems.map((item) => (
                <Button 
                  key={item.id}
                  variant="ghost"
                  onClick={() => setActiveTab(item.id)}
                  className={`justify-start cursor-pointer text-black dark:text-white h-8 ${activeTab === item.id ? 'font-bold' : 'font-normal'}`}
                >
                  <item.icon className="mr-2" /> {item.label}
                </Button>
              ))}
            </Flex>
          </Section>

          {/* Main Content */}
          <Section className="flex-1 h-screen px-6 pt-28 bg-white dark:bg-black">
            {activeTab === 'tenants' && <TenantManagement />}
            {activeTab === 'users' && <TenantUserManagement />}
            {activeTab === 'commercialProposals' && <CommercialProposals />}
            {/* ... other tab content ... */}
          </Section>
        </Flex>
      </Section>
    </>
  );
};

export default SuperAdminPage;
