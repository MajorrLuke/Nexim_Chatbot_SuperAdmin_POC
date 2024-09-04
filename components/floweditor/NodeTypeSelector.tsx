import * as Dialog from '@radix-ui/react-dialog';
import { FaPlay, FaStop, FaBars, FaGlobe, FaRobot } from 'react-icons/fa';

interface NodeType {
    type: 'start' | 'common' | 'end' | 'httpRequest' | 'intelligence';
    label: string;
    icon: React.ReactElement;
    category: 'Básico' | 'Avançado';
}

const nodeTypes: NodeType[] = [
    { type: 'start', label: 'Início', icon: <FaPlay />, category: 'Básico' },
    { type: 'common', label: 'Comum', icon: <FaBars />, category: 'Básico' },
    { type: 'end', label: 'Fim', icon: <FaStop />, category: 'Básico' },
    { type: 'httpRequest', label: 'Requisição HTTP', icon: <FaGlobe />, category: 'Avançado' },
    { type: 'intelligence', label: 'Inteligência', icon: <FaRobot />, category: 'Avançado' },
];

export default function NodeTypeSelector({ onSelect, onCancel }: {
    onSelect: (type: 'start' | 'common' | 'end' | 'httpRequest' | 'intelligence') => void;
    onCancel: () => void;
}) {
    return (
        <Dialog.Root open={true} onOpenChange={onCancel}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#fcf7ff] text-black dark:bg-[#000009] dark:text-[#fcf7ff] shadow-[0px_0px_20px_-5px_rgba(10,255,237,0.7)] p-6 rounded-lg max-w-md w-full space-y-4">
                    <Dialog.Title className="text-3xl font-bold mb-6 border-b pb-3 dark:border-zinc-700">Nodes</Dialog.Title>
                    
                    {['Básico', 'Avançado'].map((category, index) => (
                        <div key={category} className='border border-zinc-300 dark:border-zinc-800 rounded-md p-1'>
                            <h3 className="text-lg font-semibold mb-2 bg-zinc-300 dark:bg-zinc-800 rounded-md p-2">{category}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {nodeTypes
                                    .filter((node) => node.category === category)
                                    .map((node) => (
                                        <button
                                            key={node.type}
                                            onClick={() => onSelect(node.type)}
                                            className={`px-4 py-2 text-[#fcf7ff] text-sm font-light rounded-md flex items-center justify-start border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors duration-200`}
                                        >
                                            <span className="mr-2">{node.icon}</span>
                                            {node.label}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                    
                    <Dialog.Close asChild>
                        <button onClick={onCancel} className="mt-6 px-4 py-2 bg-[#000009] dark:bg-[#fcf7ff] text-[#fcf7ff] dark:text-black rounded-md hover:bg-opacity-80 transition-colors duration-200 w-full">
                            Cancelar
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}