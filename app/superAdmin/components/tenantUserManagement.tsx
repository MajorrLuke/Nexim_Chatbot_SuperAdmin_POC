import React, { useState, useEffect } from 'react';
import { Button, Flex, TextField, Heading, Table, IconButton, Dialog } from '@radix-ui/themes';
import { FaEdit, FaTrash, FaUserPlus, FaSearch } from 'react-icons/fa';

interface Tenant {
  _id: string;
  id: number;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const TenantUserManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    const response = await fetch('/api/tenants/fetch');
    if (response.ok) {
      const data = await response.json();
      setTenants(data);
    } else {
      console.error('Failed to fetch tenants');
    }
  };

  const fetchUsers = async (tenantId: number) => {
    const response = await fetch(`/api/users/fetch?tenantId=${tenantId}`);
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    } else {
      console.error('Failed to fetch users');
    }
  };

  const handleTenantClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    fetchUsers(tenant.id);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          role: userRole,
          password: userPassword,
          tenant: selectedTenant?.id,
        }),
      });

      if (response.ok) {
        setIsUserModalOpen(false);
        fetchUsers(selectedTenant!.id);
        resetUserForm();
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/delete?id=${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchUsers(selectedTenant!.id);
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetUserForm = () => {
    setUserName('');
    setUserEmail('');
    setUserRole('');
    setUserPassword('');
    setEditingUser(null);
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(tenantFilter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <Flex className="flex-1 overflow-hidden">
        <div className="w-1/3 h-full pr-4 border-r-2 border-gray-300/20 overflow-y-auto">
          <Heading size="4" className="mb-2">Tenants</Heading>
          <Flex align="center" className="mb-2">
            <FaSearch className="mr-2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter tenants..."
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </Flex>
          {filteredTenants.map((tenant) => (
            <Button
              key={tenant.id}
              onClick={() => handleTenantClick(tenant)}
              className={`w-full mb-2 ${selectedTenant?.id === tenant.id ? 'bg-[#54428e] text-white' : ''}`}
            >
              {tenant.name}
            </Button>
          ))}
        </div>
        <div className="w-2/3 h-full overflow-y-auto pl-4 duration-300">
          {selectedTenant && (
            <div className="animate-fade-in">
              <Flex justify="between" align="center" className="mb-4">
                <Heading size="4">Users for {selectedTenant.name}</Heading>
                <Button onClick={() => setIsUserModalOpen(true)} className="bg-[#54428e] cursor-pointer">
                  <FaUserPlus className="mr-2" /> Add User
                </Button>
              </Flex>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row key={user._id}>
                      <Table.Cell>{user.name}</Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{user.role}</Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <IconButton onClick={() => handleEditUser(user)} variant="soft">
                            <FaEdit />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteUser(user._id)} color="red" variant="soft">
                            <FaTrash />
                          </IconButton>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
          )}
        </div>
      </Flex>

      <Dialog.Root open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>{editingUser ? 'Edit User' : 'Add User'}</Dialog.Title>
          <form onSubmit={handleCreateUser}>
            <Flex direction="column" gap="4">
              <input
                placeholder="User Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
              </select>
              {!editingUser && (
                <input
                  type="password"
                  placeholder="Password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                />
              )}
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" className="bg-[#54428e] cursor-pointer">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default TenantUserManagement;