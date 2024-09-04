import React, { useState, useEffect } from 'react';
import { Button, Flex, TextField, Heading, Table, IconButton, Dialog } from '@radix-ui/themes';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface Tenant {
  _id: string;
  name: string;
  email: string;
  tier: string;
}

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantTier, setTenantTier] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

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

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tenants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: tenantName, email: tenantEmail, tier: tenantTier }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Tenant created:', data);
        // Reset form fields
        setTenantName('');
        setTenantEmail('');
        setTenantTier('');
        setIsEditModalOpen(false);
        // Refresh tenant list
        fetchTenants();
      } else {
        console.error('Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setTenantName(tenant.name);
    setTenantEmail(tenant.email);
    setTenantTier(tenant.tier);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tenants/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: editingTenant?._id, name: tenantName, email: tenantEmail, tier: tenantTier }),
      });

      if (response.ok) {
        console.log('Tenant updated successfully');
        setIsEditModalOpen(false);
        setEditingTenant(null);
        setTenantName('');
        setTenantEmail('');
        setTenantTier('');
        // Refresh tenant list
        fetchTenants();
      } else {
        const data = await response.json();
        console.error('Failed to update tenant:', data.error);
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tenantToDelete) return;

    try {
      const response = await fetch(`/api/tenants/delete?id=${tenantToDelete._id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchTenants(); // Refresh the tenant list
        setIsDeleteDialogOpen(false);
        setTenantToDelete(null);
      } else {
        const data = await response.json();
        console.error('Failed to delete tenant:', data.error);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div>
      <Flex justify="between" align="center" className="mb-4">
        <Heading size="5">Tenant Management</Heading>
        <Button onClick={() => setIsEditModalOpen(true)} className="bg-[#54428e] cursor-pointer">
          Add Tenant
        </Button>
      </Flex>

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Tier</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tenants.map((tenant, index) => (
            <Table.Row key={tenant._id}>
              <Table.Cell>{index + 1}</Table.Cell>
              <Table.Cell>{tenant.name}</Table.Cell>
              <Table.Cell>{tenant.email}</Table.Cell>
              <Table.Cell>{tenant.tier}</Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <IconButton onClick={() => handleEditTenant(tenant)} variant="soft">
                    <FaEdit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTenant(tenant)} color="red" variant="soft">
                    <FaTrash />
                  </IconButton>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>{editingTenant ? 'Edit Tenant' : 'Add Tenant'}</Dialog.Title>
          <form onSubmit={editingTenant ? handleSaveEdit : handleCreateTenant}>
            <Flex direction="column" gap="4">

                <input
                  placeholder="Tenant Name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Admin Email"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  required
                />

              <select
                value={tenantTier}
                onChange={(e) => setTenantTier(e.target.value)}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Tier</option>
                <option value="tier1">Tier 1</option>
                <option value="tier2">Tier 2</option>
                <option value="tier3">Tier 3</option>
                <option value="tier4">Tier 4</option>
              </select>
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" className="bg-[#54428e] cursor-pointer">
                  {editingTenant ? 'Save Changes' : 'Create Tenant'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete the tenant "{tenantToDelete?.name}"? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={confirmDelete} color="red">
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default TenantManagement;
