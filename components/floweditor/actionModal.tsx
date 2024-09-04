'use client'
import React, { FC, useState } from 'react';
import { ActionModalProps, Action, Condition } from '@/app/definitions/floweditor/definitions';
import { Button, Card } from '@radix-ui/themes';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Toast from '@radix-ui/react-toast';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { FaRegTrashAlt } from "react-icons/fa";
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import HttpRequestConfig from '@/components/actionModalComponents/httpRequestConfig';

const ActionModal: FC<ActionModalProps> = ({ node, actions, conditions, onClose, onSave, allNodes, onDeleteNode, flowVariables }) => {
  const [editedLabel, setEditedLabel] = useState(node.data.label);
  const [editedActions, setEditedActions] = useState(actions);
  const [editedConditions, setEditedConditions] = useState(conditions);
  const [activeTab, setActiveTab] = useState<'request' | 'conditions' | 'actions' | 'intelligence'>(
    ({ httpRequest: 'request', intelligence: 'intelligence' }[node.data.type] || 'actions') as 'request' | 'conditions' | 'actions' | 'intelligence'
  );
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [hasError, setHasError] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [waitForUserInput, setWaitForUserInput] = useState(node.data.waitAnswer || false);
  const [url, setUrl] = useState(node.data.url || '');
  const [method, setMethod] = useState(node.data.method || 'GET');
  const [body, setBody] = useState(node.data.body || '');
  const [headers, setHeaders] = useState<{ [key: string]: string }>(node.data.headers || {});
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [language, setLanguage] = useState(node.data.language || 'English');
  const [query, setQuestion] = useState(node.data.query || '');

  const isEndNode = node.data.type === 'end';
  const isHttpRequestNode = node.data.type === 'httpRequest';
  const isIntelligenceNode = node.data.type === 'intelligence';

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedLabel(e.target.value);
  };

  const handleActionChange = (index: number, field: string, value: string) => {
    const newActions = [...editedActions];
    newActions[index] = { ...newActions[index], [field]: value };
    setEditedActions(newActions);
  };

  const handleConditionChange = (index: number, field: string, value: string) => {
    const newConditions = [...editedConditions];
    if (index === 0 && field !== 'nextNode') return; // Prevent changes to default condition except for nextNode
    newConditions[index] = { ...newConditions[index], [field]: value };

    // Update parameter type when selecting a variable or custom value
    if (field === 'parameter1Value') {
      newConditions[index].parameter1Type = value === 'custom' ? 'custom' : 'variable';
      if (value === 'custom') {
        newConditions[index].parameter1Value = ''; // Clear the value when switching to custom
      }
    }
    if (field === 'parameter2Value') {
      newConditions[index].parameter2Type = value === 'custom' ? 'custom' : 'variable';
      if (value === 'custom') {
        newConditions[index].parameter2Value = ''; // Clear the value when switching to custom
      }
    }

    setEditedConditions(newConditions);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
    // Automatically close the toast after 3 seconds
    setTimeout(() => setToastOpen(false), 3000);
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setHasError(false);

    const incompleteAction = editedActions.find(action => !action.content.trim());
    if (incompleteAction) {
      showToast('Cannot save: One or more actions have no content.', 'error');
      setHasError(true);
      return;
    }

    const incompleteCondition = editedConditions.find((condition, index) => {
      if (index === 0) return !condition.nextNode?.trim();
      return !condition.action || !condition.parameter1Value?.trim() || !condition.parameter2Value?.trim() || !condition.nextNode?.trim();
    });
    if (incompleteCondition) {
      showToast('Cannot save: One or more conditions are incomplete.', 'error');
      setHasError(true);
      return;
    }

    onSave(
      editedLabel,
      editedActions,
      editedConditions,
      waitForUserInput,
      {
        ...node.data,
        label: editedLabel,
        url,
        method,
        body,
        headers,
        language,
        query,
      },
      imagesToDelete
    );
    showToast('Node updated successfully', 'success');
    onClose();
  };

  const handleAddAction = () => {
    const maxId = Math.max(...editedActions.map(action => action.id), 0);
    const newAction: Action = {
      id: (maxId + 1),
      type: 'text',
      content: '',
    };
    setEditedActions([...editedActions, newAction]);
  };

  const handleAddCondition = () => {
    const newCondition: Condition = {
      action: '',
      parameter1Type: 'custom',
      parameter1Value: '',
      parameter2Type: 'custom',
      parameter2Value: '',
      nextNode: '',
    };
    setEditedConditions([...editedConditions, newCondition]);
  };

  const handleDeleteAction = (index: number) => {
    const actionToDelete = editedActions[index];
    if (actionToDelete.type === 'image' && actionToDelete.content) {
      setImagesToDelete(prev => [...prev, actionToDelete.content]);
    }
    const newActions = editedActions.filter((_, i) => i !== index);
    setEditedActions(newActions);
  };

  const handleDeleteCondition = (index: number) => {
    if (index === 0) return; // Prevent deletion of default condition
    const newConditions = editedConditions.filter((_, i) => i !== index);
    setEditedConditions(newConditions);
  };

  const handleDeleteNode = () => {
    setIsAlertOpen(true);
  };

  const conditionTypes = [
    { value: 'equal', label: 'Equal (==)' },
    { value: 'equalType', label: 'Equal Type (===)' },
    { value: 'false', label: 'False' },
    { value: 'true', label: 'True' },
    { value: 'notEqual', label: 'Not Equal (!=)' },
    { value: 'notEqualType', label: 'Not Equal Type (!==)' },
    { value: 'greaterThan', label: 'Greater Than (>)' },
    { value: 'lessThan', label: 'Less Than (<)' },
    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal To (>=)' },
    { value: 'lessThanOrEqual', label: 'Less Than or Equal To (<=)' },
  ];

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        const uniqueImageName = `${Date.now()}-${uuidv4()}.${file.name.split('.').pop()}`;
        formData.append('file', file, uniqueImageName);

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBaseUrl}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const oldImageUrl = editedActions[index].content;
          if (oldImageUrl) {
            setImagesToDelete(prev => [...prev, oldImageUrl]);
          }
          handleActionChange(index, 'content', data.url);
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Failed to upload image', 'error');
      }
    }
  };

  return (
    <Toast.Provider swipeDirection="right">
      <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 right-0 w-96 bg-[#fcf7ff] text-black dark:bg-[#000009] dark:text-[#fcf7ff] shadow-[0px_0px_20px_-5px_rgba(10,255,237,0.7)] p-6 overflow-y-auto">
            <Dialog.Title className="text-3xl font-bold mb-6 border-b pb-3 dark:border-zinc-700 flex justify-between items-center">
              Editar Node
              <Button
                onClick={handleDeleteNode}
                color="red"
                variant="soft"
                className="py-2 px-4 rounded-md text-sm font-medium hover:bg-red-600 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Excluir Node
              </Button>
            </Dialog.Title>
            <div className="mb-6">
              <Label.Root htmlFor="node-label" className="block mb-2 text-md font-medium">Label:</Label.Root>
              <input
                id="node-label"
                type="text"
                value={editedLabel}
                onChange={handleLabelChange}
                className="w-full p-2 text-sm font-light border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:ring-2 focus:ring-[#54428e] transition-all duration-200"
              />
            </div>
            <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as 'request' | 'conditions' | 'actions')}>
              <Tabs.List className="flex mb-6 bg-zinc-200 dark:bg-zinc-800 rounded-md p-1 border-zinc-300 dark:border-zinc-600 border">
                {isHttpRequestNode ? (
                  <>
                    <Tabs.Trigger
                      value="request"
                      className="flex-1 px-4 py-2 text-sm font-light rounded-md data-[state=active]:bg-[#54428e] data-[state=active]:text-white transition-colors duration-200"
                    >
                      Requisição
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="conditions"
                      className="flex-1 px-4 py-2 text-sm font-light rounded-md data-[state=active]:bg-[#54428e] data-[state=active]:text-white transition-colors duration-200"
                    >
                      Condições
                    </Tabs.Trigger>
                  </>
                ) : isIntelligenceNode ? (
                  <>
                    <Tabs.Trigger
                      value="intelligence"
                      className="flex-1 px-4 py-2 text-sm font-light rounded-md data-[state=active]:bg-[#54428e] data-[state=active]:text-white transition-colors duration-200">
                      Inteligência
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="conditions"
                      className="flex-1 px-4 py-2 text-sm font-light rounded-md data-[state=active]:bg-[#54428e] data-[state=active]:text-white transition-colors duration-200"
                    >
                      Condições
                    </Tabs.Trigger>
                  </>
                ) : (
                  <>
                    <Tabs.Trigger
                      value="actions"
                      className="flex-1 px-4 py-2 text-sm font-light rounded-md data-[state=active]:bg-[#54428e] data-[state=active]:text-white transition-colors duration-200"
                    >
                      Ações
                    </Tabs.Trigger>
                    {node.data.type !== 'end' && (
                      <Tabs.Trigger
                        value="conditions"
                        className="flex-1 px-4 py-2 text-sm font-light rounded-md data-[state=active]:bg-[#54428e] data-[state=active]:text-white transition-colors duration-200"
                      >
                        Condições
                      </Tabs.Trigger>
                    )}
                  </>
                )}
              </Tabs.List>

              {isHttpRequestNode ? (
                <>
                  <Tabs.Content value="request">
                    <HttpRequestConfig
                      url={url}
                      setUrl={setUrl}
                      method={method}
                      setMethod={setMethod}
                      body={body}
                      setBody={setBody}
                      headers={headers}
                      setHeaders={setHeaders}
                    />
                  </Tabs.Content>
                </>
              ) : isIntelligenceNode ? (
                <>
                  <Tabs.Content value="intelligence" className="p-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-md border-zinc-300 dark:border-zinc-600 border">
                    <div className="space-y-6">
                      <div className="relative">
                        <Label.Root htmlFor="language" className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Idioma:</Label.Root>
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out"
                        >
                          {[
                            { code: 'auto', name: 'Automático' },
                            { code: 'en_US', name: 'Inglês' },
                            { code: 'pt_BR', name: 'Português (Brasil)' },
                            { code: 'es_ES', name: 'Espanhol' },
                            { code: 'fr_FR', name: 'Francês' },
                            { code: 'de_DE', name: 'Alemão' },
                            { code: 'zh_CN', name: 'Chinês' },
                          ].map((lang) => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label.Root htmlFor="question" className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Instruções:</Label.Root>
                        <textarea
                          id="question"
                          value={query as string}
                          onChange={(e) => setQuestion(e.target.value)}
                          className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out resize-none"
                          rows={5}
                          placeholder="Digite suas instruções aqui..."
                        />
                      </div>
                    </div>
                  </Tabs.Content>
                </>
              ) : (
                <>
                  <Tabs.Content value="actions" className="space-y-4">
                    {editedActions.map((action, index) => (
                      // <Card key={action.id} className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 border-2 border-[#54428e]/30 dark:border-[#ffc857]/20 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                      <Card key={action.id} className="relative p-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 text-[#54428e] dark:text-[#ffc857]">Ação {index + 1}</h3>
                        <div className="mb-4">
                          <Label.Root htmlFor={`action-type-${index}`} className="block mb-2 text-sm font-light text-zinc-700 dark:text-zinc-300">Tipo:</Label.Root>
                          <Select.Root
                            value={action.type}
                            onValueChange={(value) => handleActionChange(index, 'type', value)}
                          >
                            <Select.Trigger id={`action-type-${index}`} className="w-full p-1 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out">
                              <Select.Value placeholder="Selecione um tipo" />
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="bg-white dark:bg-neutral-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-lg" position="popper" sideOffset={5}>
                                <Select.Viewport className="p-1">
                                  <Select.Item value="text" className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded text-sm font-light text-[#fcf7ff]">
                                    <Select.ItemText>Texto</Select.ItemText>
                                  </Select.Item>
                                  <Select.Item value="image" className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded text-sm font-light text-[#fcf7ff]">
                                    <Select.ItemText>Imagem</Select.ItemText>
                                  </Select.Item>
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </div>
                        <div className="mb-4">
                          <Label.Root htmlFor={`action-type-${index}`} className="block mb-2 text-sm font-light text-zinc-700 dark:text-zinc-300">Conteúdo:</Label.Root>
                          {action.type === 'text' ? (
                            <input
                              id={`action-content-${index}`}
                              type="text"
                              value={action.content}
                              onChange={(e) => handleActionChange(index, 'content', e.target.value)}
                              className={`w-full p-1 bg-white dark:bg-neutral-700 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out ${
                                hasError && !action.content.trim() ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
                              }`}
                            />
                          ) : action.type === 'image' ? (
                            <div className="relative">
                              <input
                                id={`action-content-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(index, e)}
                                className="hidden"
                              />
                              <label
                                htmlFor={`action-content-${index}`}
                                className="flex items-center justify-center w-full p-1 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-neutral-600 transition duration-150 ease-in-out"
                              >
                                <span className="text-zinc-600 dark:text-zinc-300">Escolher arquivo</span>
                              </label>
                            </div>
                          ) : null}
                        </div>
                        <Button
                          onClick={() => handleDeleteAction(index)}
                          color="red"
                          variant="surface"
                          className="absolute top-2 right-2 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200 cursor-pointer"
                        >
                          <FaRegTrashAlt className="text-red-500 dark:text-red-400" />
                        </Button>
                      </Card>
                    ))}
                    <Button
                      onClick={handleAddAction}
                      className="w-full py-3 text-md font-light rounded-lg bg-gradient-to-r from-[#54428e] to-[#7a5fcc] hover:from-[#4a3a7d] hover:to-[#6b52b3] text-[#fcf7ff] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Adicionar Ação
                    </Button>
                  </Tabs.Content>
                </>
              )}
              
              <Tabs.Content value="conditions" className="space-y-6">
                {editedConditions.map((condition, index) => (
                  <Card key={index} className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 border-2 border-[#54428e]/30 dark:border-[#ffc857]/30 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-[#54428e] dark:text-[#ffc857]">
                      {index === 0 ? 'Condição Padrão' : `Condição ${index}`}
                    </h3>
                    {index !== 0 && (
                      <>
                        <div className="mb-4">
                          <Label.Root htmlFor={`condition-action-${index}`} className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Condição:</Label.Root>
                          <Select.Root
                            value={condition.action}
                            onValueChange={(value) => handleConditionChange(index, 'action', value)}
                          >
                            <Select.Trigger id={`condition-action-${index}`} className="w-full p-3 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-2 focus:ring-[#54428e] dark:focus:ring-[#ffc857] focus:border-transparent transition duration-150 ease-in-out">
                              <Select.Value placeholder="Selecione uma ação" />
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="bg-white dark:bg-neutral-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-lg" position="popper" sideOffset={5}>
                                <Select.Viewport className="p-1">
                                  {conditionTypes.map((type) => (
                                    <Select.Item key={type.value} value={type.value} className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded">
                                      <Select.ItemText>{type.label}</Select.ItemText>
                                    </Select.Item>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </div>
                        <div className="mb-4">
                          <Label.Root htmlFor={`condition-param1-${index}`} className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Parâmetro 1:</Label.Root>
                          <Select.Root
                            value={condition.parameter1Type === 'custom' ? 'custom' : condition.parameter1Value}
                            onValueChange={(value) => handleConditionChange(index, 'parameter1Value', value)}
                          >
                            <Select.Trigger id={`condition-param1-${index}`} className="w-full p-3 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-2 focus:ring-[#54428e] dark:focus:ring-[#ffc857] focus:border-transparent transition duration-150 ease-in-out">
                              <Select.Value>
                                {condition.parameter1Type === 'custom'
                                  ? 'Valor Personalizado'
                                  : condition.parameter1Value || 'Selecione uma variável ou insira um valor personalizado'}
                              </Select.Value>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="bg-white dark:bg-neutral-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-lg" position="popper" sideOffset={5}>
                                <Select.Viewport className="p-1">
                                  {flowVariables.map((variable) => (
                                    <Select.Item key={variable.name} value={variable.name} className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded">
                                      <Select.ItemText>{variable.name}</Select.ItemText>
                                    </Select.Item>
                                  ))}
                                  <Select.Item value="custom" className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded">
                                    <Select.ItemText>Valor Personalizado</Select.ItemText>
                                  </Select.Item>
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                          {condition.parameter1Type === 'custom' && (
                            <input
                              type="text"
                              value={condition.parameter1Value}
                              onChange={(e) => handleConditionChange(index, 'parameter1Value', e.target.value)}
                              className="mt-2 block w-full p-3 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-2 focus:ring-[#54428e] dark:focus:ring-[#ffc857] focus:border-transparent transition duration-150 ease-in-out"
                              placeholder="Insira o valor personalizado"
                            />
                          )}
                        </div>
                        <div className="mb-4">
                          <Label.Root htmlFor={`condition-param2-${index}`} className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Parâmetro 2:</Label.Root>
                          <Select.Root
                            value={condition.parameter2Type === 'custom' ? 'custom' : condition.parameter2Value}
                            onValueChange={(value) => handleConditionChange(index, 'parameter2Value', value)}
                          >
                            <Select.Trigger id={`condition-param2-${index}`} className="w-full p-3 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-2 focus:ring-[#54428e] dark:focus:ring-[#ffc857] focus:border-transparent transition duration-150 ease-in-out">
                              <Select.Value>
                                {condition.parameter2Type === 'custom'
                                  ? 'Valor Personalizado'
                                  : condition.parameter2Value || 'Selecione uma variável ou insira um valor personalizado'}
                              </Select.Value>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="bg-white dark:bg-neutral-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-lg" position="popper" sideOffset={5}>
                                <Select.Viewport className="p-1">
                                  {flowVariables.map((variable) => (
                                    <Select.Item key={variable.name} value={variable.name} className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded">
                                      <Select.ItemText>{variable.name}</Select.ItemText>
                                    </Select.Item>
                                  ))}
                                  <Select.Item value="custom" className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded">
                                    <Select.ItemText>Valor Personalizado</Select.ItemText>
                                  </Select.Item>
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                          {condition.parameter2Type === 'custom' && (
                            <input
                              type="text"
                              value={condition.parameter2Value}
                              onChange={(e) => handleConditionChange(index, 'parameter2Value', e.target.value)}
                              className="mt-2 block w-full p-3 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-2 focus:ring-[#54428e] dark:focus:ring-[#ffc857] focus:border-transparent transition duration-150 ease-in-out"
                              placeholder="Insira o valor personalizado"
                            />
                          )}
                        </div>
                      </>
                    )}
                    <div className="mb-4">
                      <Label.Root htmlFor={`condition-next-node-${index}`} className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Próximo Nó:</Label.Root>
                      {allNodes.length > 1 ? (
                        <Select.Root
                          value={condition.nextNode || ''}
                          onValueChange={(value) => handleConditionChange(index, 'nextNode', value)}
                        >
                          <Select.Trigger id={`condition-next-node-${index}`} className="w-full p-3 bg-white dark:bg-neutral-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-2 focus:ring-[#54428e] dark:focus:ring-[#ffc857] focus:border-transparent transition duration-150 ease-in-out">
                            <Select.Value placeholder="Selecione o próximo nó">
                              {condition.nextNode
                                ? allNodes.find(n => n.id === condition.nextNode)?.data.label
                                : 'Selecione o próximo nó'}
                            </Select.Value>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content className="bg-white dark:bg-neutral-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-lg" position="popper" sideOffset={5}>
                              <Select.Viewport className="p-1">
                                {allNodes
                                  .filter((n) => n.id !== node.id)
                                  .map((n) => (
                                    <Select.Item key={n.id} value={n.id} className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-700 cursor-pointer outline-none rounded">
                                      <Select.ItemText>{n.data.label}</Select.ItemText>
                                    </Select.Item>
                                  ))}
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      ) : (
                        <div className="mt-1 p-3 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-200 rounded-md">
                          Por favor, crie mais nós para configurar as conexões.
                        </div>
                      )}
                    </div>
                    {index !== 0 && (
                      <Button
                        onClick={() => handleDeleteCondition(index)}
                        color="red"
                        variant="soft"
                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
                      >
                        <FaRegTrashAlt className="text-red-500 dark:text-red-400" />
                      </Button>
                    )}
                  </Card>
                ))}
                {allNodes.length > 1 && (
                  <Button
                    onClick={handleAddCondition}
                    className="w-full py-3 text-lg font-medium rounded-lg bg-gradient-to-r from-[#54428e] to-[#7a5fcc] hover:from-[#4a3a7d] hover:to-[#6b52b3] text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Adicionar Condição
                  </Button>
                )}
              </Tabs.Content>
            </Tabs.Root>


            {!isHttpRequestNode && !isIntelligenceNode && (
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="waitForUserInput"
                  checked={waitForUserInput}
                  onChange={(e) => setWaitForUserInput(e.target.checked)}
                  className="mr-2"
                />
                <Label.Root htmlFor="waitForUserInput">Wait for user input</Label.Root>
              </div>
            )}

            <div className="mt-16 flex justify-center space-x-4 w-full">
              <Dialog.Close asChild>
                <Button color="gray" className="text-black bg-[#ffc857] hover:bg-[#ffb827] transition-colors duration-300 py-2 px-4 text-md font-medium rounded-lg shadow-md hover:shadow-lg flex-1 cursor-pointer">Fechar</Button>
              </Dialog.Close>
              <Button onClick={handleSave} color="blue" className="bg-[#0affed] hover:bg-[#00e6d5] text-black transition-colors duration-300 py-2 px-4 text-md font-medium rounded-lg shadow-md hover:shadow-lg flex-1 cursor-pointer">Salvar</Button>
            </div>
          </Dialog.Content>
          <Toast.Root
            className={`${toastType === 'error' ? 'bg-red-500' : 'bg-green-500'
              } text-white p-4 rounded shadow-lg fixed bottom-4 right-4 z-50`}
            open={toastOpen}
            onOpenChange={setToastOpen}
          >
            <Toast.Title className="font-bold">{toastType === 'error' ? 'Error' : 'Success'}</Toast.Title>
            <Toast.Description>{toastMessage}</Toast.Description>
          </Toast.Root>
          <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50" />
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
            <AlertDialog.Title className="text-lg font-bold mb-4">Delete Node</AlertDialog.Title>
            <AlertDialog.Description className="mb-4">
              Are you sure you want to delete this node? This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end space-x-2">
              <AlertDialog.Cancel asChild>
                <Button color="gray" className="py-1 px-2 rounded">Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  color="red"
                  className="py-1 px-2 rounded"
                  onClick={() => {
                    onDeleteNode(node.id);
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

    </Toast.Provider>
  );
};

export default ActionModal;