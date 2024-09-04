import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, IconButton } from '@radix-ui/themes';
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { ConfigModalProps } from '@/app/definitions/floweditor/definitions';

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, flowVariables, onSave, flowId }) => {
  const [localVariables, setLocalVariables] = useState<{ name: string; defaultValue: string }[]>(flowVariables);
  const [isVariablesExpanded, setIsVariablesExpanded] = useState(true);

  useEffect(() => {
    setLocalVariables(flowVariables);
  }, [flowVariables]);

  const handleAddVariable = () => {
    setLocalVariables([...localVariables, { name: '', defaultValue: '' }]);
  };

  const handleRemoveVariable = (index: number) => {
    setLocalVariables(localVariables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (index: number, field: 'name' | 'defaultValue', value: string) => {
    const updatedVariables = [...localVariables];
    updatedVariables[index][field] = value;
    setLocalVariables(updatedVariables);
  };

  const handleSave = () => {
    onSave(localVariables);
    onClose();
  };

  const toggleVariablesExpanded = () => {
    setIsVariablesExpanded(!isVariablesExpanded);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center bg-transparent">
          <div className="shadow-[0px_0px_20px_-5px_rgba(10,255,237,0.7)] bg-[#fcf7ff] dark:bg-[#000009] text-[#000009] dark:text-[#fcf7ff] p-8 rounded-xl w-2/4 max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-3xl font-bold mb-6 border-b pb-3 dark:border-zinc-700">Configuração do Fluxo</Dialog.Title>

            <div className="mb-6">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 p-3 rounded-lg transition-colors duration-200"
                onClick={toggleVariablesExpanded}
              >
                <h3 className="text-xl font-semibold">Variáveis</h3>
                {isVariablesExpanded ? <FaChevronUp className="text-zinc-500" /> : <FaChevronDown className="text-zinc-500" />}
              </div>

              {isVariablesExpanded && (
                <div className="mt-4 space-y-4">
                  {localVariables.map((variable, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                        placeholder="Nome da variável"
                        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
                      />
                      <input
                        type="text"
                        value={variable.defaultValue}
                        onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                        placeholder="Valor padrão"
                        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
                      />
                      <IconButton onClick={() => handleRemoveVariable(index)} color="red" variant="soft" className="hover:bg-red-200 dark:hover:bg-red-900 transition-colors duration-200">
                        <FaTrash />
                      </IconButton>
                    </div>
                  ))}
                  <Button onClick={handleAddVariable} className="mt-4 bg-[#54428e] hover:bg-[#6a549e] text-[#fcf7ff] px-4 py-2 rounded-md transition-colors duration-200">
                    <FaPlus className="mr-2" /> Adicionar Variável
                  </Button>
                </div>
              )}
            </div>

            {/* Espaço para futuras abas de configuração */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Outras Configurações</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Opções futuras de configuração serão adicionadas aqui.</p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button onClick={onClose} className="bg-zinc-200 hover:bg-zinc-300 text-[#000009] px-4 py-2 rounded-md transition-colors duration-200">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-[#0affed] hover:bg-[#0ce6d6] text-[#000009] px-4 py-2 rounded-md transition-colors duration-200">
                Salvar
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfigModal;