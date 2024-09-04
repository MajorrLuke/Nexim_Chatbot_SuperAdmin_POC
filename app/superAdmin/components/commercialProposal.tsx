import React, { useState, useEffect } from 'react';
import { Button, Flex, TextField, Heading, Table, IconButton, Dialog, Section } from '@radix-ui/themes';
import { FaEdit, FaTrash, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button as ShadcnButton } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Tier {
  adminLicenses: string;
  agentLicenses: string;
  llmTokens: string;
  aiDatabase: string;
  flowBots: string;
  support: string;
  monthlyTenantFee: {
    amount: string;
    currency: string;
  };
  licensePrice: {
    amount: string;
    currency: string;
  };
  monthlyTenantFeeCurrency?: string;
  licensePriceCurrency?: string;
}

interface Proposal {
  _id: string;
  name: string;
  dueDate: string;
  tiers: {
    [key: string]: Tier;
  };
}

interface EditingProposal {
  id: string;
  data: {
    name: string;
    dueDate: string;
    tiers: { [key: string]: Tier };
  };
}

const CommercialProposal: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<EditingProposal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchProposals();
  }, []);


  const fetchProposals = async () => {
    try {
      const response = await fetch(`/api/commercial/proposals/fetch`);
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      } else {
        console.error('Failed to fetch proposals');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const resetForm = () => {
    setEditingProposal(null);
    setSelectedDate(undefined);
  };

  const handleAddProposal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSaveProposal = async (values: any) => {
    const updatedValues = {
      ...values,
      dueDate: selectedDate ? selectedDate.toISOString() : null,
    };

    // Restructure the tiers data
    ['tier1', 'tier2', 'tier3', 'tier4'].forEach(tier => {
      updatedValues[tier] = {
        ...updatedValues[`tiers.${tier}.monthlyTenantFee`],
        monthlyTenantFee: {
          amount: updatedValues[`tiers.${tier}.monthlyTenantFee`],
          currency: updatedValues[`tiers.${tier}.monthlyTenantFeeCurrency`]
        },
        licensePrice: {
          amount: updatedValues[`tiers.${tier}.licensePrice`],
          currency: updatedValues[`tiers.${tier}.licensePriceCurrency`]
        }
      };
      // Remove the old properties
      delete updatedValues[`tiers.${tier}.monthlyTenantFee`];
      delete updatedValues[`tiers.${tier}.monthlyTenantFeeCurrency`];
      delete updatedValues[`tiers.${tier}.licensePrice`];
      delete updatedValues[`tiers.${tier}.licensePriceCurrency`];
    });

    try {
      const url = editingProposal
        ? `/api/commercial/proposals/edit/?id=${editingProposal.id}` // Use editingProposal.id here
        : `/api/commercial/proposals/create`;
      const method = editingProposal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedValues),
      });

      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchProposals();
      } else {
        throw new Error('Failed to save proposal');
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
    }
  };

  const handleDeleteProposal = async (proposal: Proposal) => {
    setProposalToDelete(proposal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!proposalToDelete) return;

    try {
      const response = await fetch(`/api/commercial/proposals/delete?id=${proposalToDelete._id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProposals();
        setIsDeleteDialogOpen(false);
        setProposalToDelete(null);
      } else {
        console.error('Failed to delete proposal');
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const handleEditProposal = (proposal: Proposal) => {
    const formattedTiers = {} as { [key: string]: any };
    ['tier1', 'tier2', 'tier3', 'tier4'].forEach(tier => {
      if (proposal.tiers && proposal.tiers[tier]) {
        formattedTiers[tier] = {
          ...proposal.tiers[tier],
          monthlyTenantFee: proposal.tiers[tier].monthlyTenantFee.amount,
          monthlyTenantFeeCurrency: proposal.tiers[tier].monthlyTenantFee.currency,
          licensePrice: proposal.tiers[tier].licensePrice.amount,
          licensePriceCurrency: proposal.tiers[tier].licensePrice.currency,
        };
      } else {
        formattedTiers[tier] = {} as Tier;
      }
    });

    setEditingProposal({
      id: proposal._id,
      data: {
        name: proposal.name,
        dueDate: proposal.dueDate,
        tiers: formattedTiers
      }
    });
    setSelectedDate(proposal.dueDate ? new Date(proposal.dueDate) : undefined);
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Proposal) => (
        <Flex gap="2">
          <IconButton
            onClick={() => window.open(`https://usenexim.com/commercialproposal/${record._id}`, '_blank')}
            variant="soft"
          >
            <FaExternalLinkAlt />
          </IconButton>
          <IconButton onClick={() => handleEditProposal(record)} variant="soft">
            <FaEdit />
          </IconButton>
          <IconButton onClick={() => handleDeleteProposal(record)} color="red" variant="soft">
            <FaTrash />
          </IconButton>
        </Flex>
      ),
    },
  ];

  return (
    <>
        <div>
        <Flex justify="between" align="center" className="mb-4">
            <Heading size="5">Commercial Proposals</Heading>
            <Button onClick={handleAddProposal} className="bg-[#54428e] cursor-pointer">
            <FaPlus /> Add Proposal
            </Button>
        </Flex>

        <Table.Root variant="surface">
            <Table.Header>
            <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
            </Table.Header>
            <Table.Body>
            {proposals.map((proposal) => (
              <Table.Row key={proposal._id}>
                <Table.Cell>{proposal.name}</Table.Cell>
                <Table.Cell>{new Date(proposal.dueDate).toLocaleDateString()}</Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <IconButton
                      onClick={() => window.open(`https://usenexim.com/commercial/proposal/${proposal._id}`, '_blank')}
                      variant="soft"
                      className='cursor-pointer'
                    >
                      <FaExternalLinkAlt />
                    </IconButton>
                    <IconButton onClick={() => handleEditProposal(proposal)} variant="soft" className='cursor-pointer'>
                      <FaEdit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteProposal(proposal)} color="red" variant="soft" className='cursor-pointer'>
                      <FaTrash />
                    </IconButton>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
            </Table.Body>
        </Table.Root>

        

        <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Confirm Deletion</Dialog.Title>
            <Dialog.Description size="2" mb="4">
                Are you sure you want to delete the proposal "
                {proposalToDelete ? proposalToDelete.name : 'Unknown'}
                "? This action cannot be undone.
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

        
        <Dialog.Root open={isModalOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsModalOpen(open);
        }}>
        <Dialog.Content className="!w-[95vw] !max-w-[95vw] bg-white dark:bg-black">
        <Dialog.Title>{editingProposal ? 'Edit Proposal' : 'Add Proposal'}</Dialog.Title>
        <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const values = Object.fromEntries(formData.entries());
            handleSaveProposal(values);
        }}>
            <Flex direction="column" gap="4">
            <input
                name="name"
                placeholder="Proposal Name"
                defaultValue={editingProposal?.data.name || ''}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-neutral-900/40 text-white cursor-pointer",
                    "!border-gray-300",
                    "!ring-1 !ring-gray-300",
                    "!outline-none focus:!outline-none",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setEditingProposal(prev => prev ? {...prev, dueDate: date?.toISOString() ?? ''} : null);
                  }}
                />
              </PopoverContent>
            </Popover>
            <Flex direction="row" gap="4" className='w-full w-max-w-[95%]'>
                {['tier1', 'tier2', 'tier3', 'tier4'].map((tier, index) => (
                <Flex 
                    key={tier} 
                    direction="column" 
                    gap="2" 
                    className={`w-1/4 border-2 p-2 rounded-md bg-neutral-900/20 ${
                        index === 0 ? 'border-[#fcf7ff] ' :
                        index === 1 ? 'border-[#54428e] ' :
                        index === 2 ? 'border-[#ffc857] ' :
                        'border-[#0affed]'
                    }`}
                >
                    <Heading size="3">{tier.charAt(0).toUpperCase() + tier.slice(1)}</Heading>
                    <input
                    name={`tiers.${tier}.adminLicenses`}
                    placeholder="Admin Licenses"
                    type="number"
                    defaultValue={editingProposal?.data.tiers?.[tier]?.adminLicenses || ''}
                    required
                    className="w-full px-3 bg-neutral-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                    />
                    <input
                    name={`tiers.${tier}.agentLicenses`}
                    placeholder="Agent Licenses"
                    type="number"
                    defaultValue={editingProposal?.data.tiers?.[tier]?.agentLicenses || ''}
                    required
                    className="w-full px-3 py-2 bg-neutral-900  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                    />
                    <div className="relative">
                      <input
                        name={`tiers.${tier}.llmTokens`}
                        placeholder="LLM Tokens"
                        type="number"
                        defaultValue={editingProposal?.data.tiers?.[tier]?.llmTokens || ''}
                        required
                        className="w-full px-3 py-2 pr-16 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        tokens
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        name={`tiers.${tier}.aiDatabase`}
                        placeholder="AI Database"
                        type="number"
                        defaultValue={editingProposal?.data.tiers?.[tier]?.aiDatabase || ''}
                        required
                        className="w-full px-3 py-2 pr-16 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        MB
                      </span>
                    </div>
                    <input
                    name={`tiers.${tier}.flowBots`}
                    placeholder="Flow Bots"
                    type="number"
                    defaultValue={editingProposal?.data.tiers?.[tier]?.flowBots || ''}
                    required
                    className="w-full px-3 py-2 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                    />
                    <select
                    name={`tiers.${tier}.support`}
                    defaultValue={editingProposal?.data.tiers?.[tier]?.support || '8hrs/5dias'}
                    required
                    className="w-full px-3 py-2 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                    >
                      <option value="8hrs/5dias">8hrs/5dias</option>
                    </select>
                    <Flex direction="column" gap="2">
                      <label htmlFor={`tiers.${tier}.monthlyTenantFee`}>Monthly Tenant Fee</label>
                      <Flex gap="2">
                        <select
                          name={`tiers.${tier}.monthlyTenantFeeCurrency`}
                          defaultValue={editingProposal?.data.tiers?.[tier]?.monthlyTenantFeeCurrency || 'USD'}
                          className="w-1/4 px-2 py-2 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                        >
                          <option value="USD">$</option>
                          <option value="BRL">R$</option>
                        </select>
                        <input
                          id={`tiers.${tier}.monthlyTenantFee`}
                          name={`tiers.${tier}.monthlyTenantFee`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          defaultValue={
                            (() => {
                              const fee = editingProposal?.data.tiers?.[tier]?.monthlyTenantFee;
                              if (typeof fee === 'object' && fee !== null) {
                                return fee.amount.toString();
                              }
                              if (typeof fee === 'string') {
                                return fee;
                              }
                              return '';
                            })()
                          }
                          required
                          className="w-3/4 px-3 py-2 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                        />
                      </Flex>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <label htmlFor={`tiers.${tier}.licensePrice`}>License Price</label>
                      <Flex gap="2">
                        <select
                          name={`tiers.${tier}.licensePriceCurrency`}
                          defaultValue={editingProposal?.data.tiers?.[tier]?.licensePriceCurrency || 'USD'}
                          className="w-1/4 px-2 py-2 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                        >
                          <option value="USD">$</option>
                          <option value="BRL">R$</option>
                        </select>
                        <input
                          id={`tiers.${tier}.licensePrice`}
                          name={`tiers.${tier}.licensePrice`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          defaultValue={
                            (() => {
                              const fee = editingProposal?.data.tiers?.[tier]?.licensePrice;
                              if (typeof fee === 'object' && fee !== null) {
                                return fee.amount.toString();
                              }
                              if (typeof fee === 'string') {
                                return fee;
                              }
                              return '';
                            })()
                          }
                          required
                          className="w-3/4 px-3 py-2 bg-neutral-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#54428e] focus:border-transparent"
                        />
                      </Flex>
                    </Flex>
                </Flex>
                ))}
            </Flex>
            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                <Button variant="soft" color="gray">
                    Cancel
                </Button>
                </Dialog.Close>
                <Button type="submit" className="bg-[#54428e] cursor-pointer">
                {editingProposal ? 'Save Changes' : 'Create Proposal'}
                </Button>
            </Flex>
            </Flex>
        </form>
        </Dialog.Content>
        </Dialog.Root>
    </>
  );
};

export default CommercialProposal;
