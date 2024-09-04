'use client'

import React, { useState, useEffect } from 'react';
import { Table, Button, Dialog, Flex, Select, Spinner, AlertDialog } from '@radix-ui/themes';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useSession } from "next-auth/react";
import Container from '@/components/Container';
import TituloBody from '@/components/TituloBody';

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'agent';
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/fetch`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        setApiError(errorData.error || 'An error occurred while fetching users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setApiError('An unexpected error occurred while fetching users');
    }
  };

  const handleDeleteConfirm = async () => {
    setApiError(null);
    if (!userToDelete) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/delete?id=${userToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        fetchUsers(); // Refresh the user list
        setUserToDelete(null);
      } else {
        setApiError(data.error || 'An error occurred while deleting the user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setApiError('An unexpected error occurred while deleting the user');
    }
  };

  const handleDelete = (userId: string) => {
    setApiError(null);
    const user = users.find(u => u._id === userId);
    if (user) {
      setUserToDelete(user);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const updatedUser = {
        ...editingUser,
        password: newPassword || undefined,
      };
      const response = await fetch(`${apiBaseUrl}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      const data = await response.json();
      if (response.ok) {
        fetchUsers();
        setIsEditModalOpen(false);
        setNewPassword('');
        setApiError(null);
      } else {
        setApiError(data.error || 'An error occurred while updating the user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setApiError('An unexpected error occurred while updating the user');
    }
  };

  const handleCreateUser = () => {
    setApiError(null);
    setEditingUser({ _id: '', name: '', email: '', role: 'agent', password: '' });
    setIsCreateModalOpen(true);
  };

  const handleSaveNewUser = async () => {
    setApiError(null);
    if (!editingUser) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editingUser, password: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchUsers();
        setIsCreateModalOpen(false);
        setNewPassword('');
        setApiError(null);
      } else {
        setApiError(data.error || 'An error occurred while creating the user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setApiError('An unexpected error occurred while creating the user');
    }
  };

  const canCreateUser = session?.user?.role === 'admin' || session?.user?.role === 'manager' || session?.user?.role === 'superAdmin';

  const availableRoles = () => {
    if (session?.user?.role === 'admin' || session?.user?.role === 'superAdmin') {
      return ['admin', 'manager'];
      //return ['admin', 'manager', 'agent'];
    } else if (session?.user?.role === 'manager') {
      return ['manager'];
      //return ['manager', 'agent'];
    }
    return [];
  };

  if (status === 'loading') {
    return (
      <Flex align="center" justify="center" className='w-full h-96'>
        <Spinner size="3" />
      </Flex>
    );
  }

  return (
    <Container>
      <TituloBody text="User Management" />
      
      {canCreateUser && (
        <div className="flex justify-end mb-4">
          <Button onClick={handleCreateUser} className="bg-[#54428e] cursor-pointer">
            Add User
          </Button>
        </div>
      )}

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
          {users.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4} className="text-center py-4">
                No users found. Click the "Add User" button to create one.
              </Table.Cell>
            </Table.Row>
          ) : (
            users.map((user) => (
              <Table.Row key={user._id}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button onClick={() => handleEdit(user)} variant="soft" className='cursor-pointer'>
                      <FaEdit />
                    </Button>
                    <Button onClick={() => handleDelete(user._id)} color="red" variant="soft" className='cursor-pointer'>
                      <FaTrash />
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit User</Dialog.Title>
          {apiError && <div className="text-white mb-4 bg-red-500/70 text-center p-2 rounded-md">{apiError}</div>}
          <Flex direction="column" gap="3">
            <label>
              Name
              <input
                type="text"
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full px-3 py-2 border rounded-md"
              />
            </label>
            <label>
              Role
              <Select.Root
                value={editingUser?.role || ''}
                onValueChange={(value) => setEditingUser(prev => ({ ...prev!, role: value as User['role'] }))}
              >
                <Select.Trigger className="w-full" />
                <Select.Content>
                  {availableRoles().map((role) => (
                    <Select.Item key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" className='cursor-pointer'>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSaveEdit} className='cursor-pointer'>Save changes</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add New User</Dialog.Title>
          {apiError && <div className="text-white mb-4 bg-red-500/70 text-center p-2 rounded-md">{apiError}</div>}
          <Flex direction="column" gap="3">
            <label>
              Name
              <input
                type="text"
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={editingUser?.password || ''}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, password: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </label>
            <label>
              Role
              <Select.Root
                value={editingUser?.role || ''}
                onValueChange={(value) => setEditingUser(prev => ({ ...prev!, role: value as User['role'] }))}
              >
                <Select.Trigger className="w-full" />
                <Select.Content>
                  {availableRoles().map((role) => (
                    <Select.Item key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" className='cursor-pointer'>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSaveNewUser} className='cursor-pointer'>Create User</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialog.Content style={{ maxWidth: 450 }}>
          <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
          {apiError && <div className="text-white mb-4 bg-red-500/70 text-center p-2 rounded-md">{apiError}</div>}
          <AlertDialog.Description size="2">
            Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" className='cursor-pointer'>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button onClick={handleDeleteConfirm} color="red" className='cursor-pointer'>
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Container>
  );
}