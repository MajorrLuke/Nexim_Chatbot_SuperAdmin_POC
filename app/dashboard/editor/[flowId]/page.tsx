'use client'

import React, { FC, useEffect, useCallback, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  MiniMap,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowEditorProps, Action, CustomNodeData, Condition } from '@/app/definitions/floweditor/definitions';
import { fetchNodes } from '@/components/floweditor/fetchNodes';
import ActionModal from '@/components/floweditor/actionModal';
import CustomNode from '@/components/floweditor/customNode';
import StartNode from '@/components/floweditor/startNode';
import StopNode from '@/components/floweditor/stopNode';
import HttpRequestNode from '@/components/floweditor/httpRequestNode';
import * as Toolbar from '@radix-ui/react-toolbar';
import { IconButton } from '@radix-ui/themes';
import { FaRegSave, FaPlus } from "react-icons/fa";
import { Toast, ToastProvider, ToastViewport } from '@radix-ui/react-toast';
import { FaCog } from "react-icons/fa";
import ConfigModal from '@/components/floweditor/configModal';
import CustomEdge from '@/components/floweditor/customEdge';
import IntelligenceNode from '@/components/floweditor/intelligenceNode';
import NodeTypeSelector from '@/components/floweditor/NodeTypeSelector';

// Add this function at the top of the file, outside of the component
function generateNodeId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

const nodeTypes = {
  customNode: CustomNode,
  startNode: StartNode,
  stopNode: StopNode,
  httpRequestNode: HttpRequestNode,
  intelligenceNode: IntelligenceNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const FlowEditor: FC<FlowEditorProps> = ({ params }) => {
  const flowId = params.flowId;
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const onConnect = useCallback(
    (params: Connection) => setEdges((els) => addEdge(params, els)),
    []
  );

  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAddingNode, setIsAddingNode] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [flowVariables, setFlowVariables] = useState<{ name: string; defaultValue: string }[]>([]);

  useEffect(() => {
    const fetchFlowVariables = async () => {
      try {
        const response = await fetch(`/api/flows/fetchVariables?flowId=${flowId}`);
        if (response.ok) {
          const data = await response.json();
          setFlowVariables(data);
        } else {
          console.error('Failed to fetch flow variables');
        }
      } catch (error) {
        console.error('Error fetching flow variables:', error);
      }
    };

    if (flowId) {
      fetchFlowVariables();
    }
  }, [flowId]);

  const handleNodeClick = (event: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const handleSaveActions = (updatedLabel: string, updatedActions: Action[], updatedConditions: Condition[], waitAnswer: boolean, nodeData: any, imagesToDelete: string[]) => {
    if (selectedNode) {
      setNodes((nodes) => nodes.map((node) => 
        node.id === selectedNode.id 
          ? { ...node, data: { ...node.data, ...nodeData, label: updatedLabel, actions: updatedActions, conditions: updatedConditions, waitAnswer: waitAnswer } }
          : node
      ));

      setEdges((edges) => {
        const filteredEdges = edges.filter(edge => edge.source !== selectedNode.id);
        const newEdges = updatedConditions.map((condition) => ({
          id: `${selectedNode.id}-${condition.nextNode}`,
          animated: true,
          type: 'custom',
          source: selectedNode.id,
          target: condition.nextNode,
          deletable: false,
          data: { label: condition.action },
          style: {
            strokeWidth: 3,
            stroke: '#2AFFED',
          },
        }));
        return [...filteredEdges, ...newEdges];
      });

      if (imagesToDelete.length > 0) {
        deleteImages(imagesToDelete);
      }
    }
  };

  const deleteImages = async (imageUrls: string[]) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${apiBaseUrl}/api/delete-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls }),
      });
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };

  const handleSave = async () => {
    const hasStartNode = nodes.some(node => node.data.type === 'start');
    const hasEndNode = nodes.some(node => node.data.type === 'end');

    if (!hasStartNode || !hasEndNode) {
      setToastMessage(`Missing ${!hasStartNode ? 'start' : 'end'} node. Please add one before saving.`);
      setToastOpen(true);
      return;
    }

    try {
      // Save the flow with nodes and edges
      const response = await fetch('/api/flows/saveFlow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flowId, nodes, edges }),
      });

      if (response.ok) {
        const result = await response.json();
        setToastMessage('Flow updated successfully');
        // Update the nodes state if needed
        if (result.updatedNodes) {
          setNodes(result.updatedNodes);
        }
      } else {
        setToastMessage('Failed to update flow');
      }
    } catch (error) {
      setToastMessage('Error updating flow');
      console.error('Error updating flow', error);
    }
    setToastOpen(true);
  };

  const handleAddNode = useCallback(() => {
    setIsAddingNode(true);
  }, []);

  const createNewNode = (type: 'start' | 'common' | 'end' | 'httpRequest' | 'intelligence') => {
    const newNodeId = generateNodeId();
    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: type === 'start' ? 'startNode' : type === 'end' ? 'stopNode' : type === 'httpRequest' ? 'httpRequestNode' : type === 'intelligence' ? 'intelligenceNode' : 'customNode',
      position: { x: Math.random() * window.innerWidth / 2, y: Math.random() * window.innerHeight / 2 },
      data: {
        id: newNodeId,
        actions: [],
        conditions: type === 'end' ? [] : [
          {
            action: 'default',
            nextNode: '',
            parameter1Type: 'custom',
            parameter1Value: '',
            parameter2Type: 'custom',
            parameter2Value: '',
          }
        ],
        flow: flowId,
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        type: type,
        waitAnswer: type === 'intelligence' ? true : false, // Set waitAnswer to true for intelligenceNode
        updatedAt: new Date().toISOString(),
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        url: type === 'httpRequest' ? 'https://' : undefined,
        method: type === 'httpRequest' ? 'GET' : undefined,
        body: type === 'httpRequest' ? '' : undefined,
        headers: type === 'httpRequest' ? {} : undefined,
        language: type === 'intelligence' ? 'English' : undefined,
        question: type === 'intelligence' ? '' : undefined,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setIsAddingNode(false);
  };

  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleOpenConfigModal = useCallback(() => {
    setIsConfigModalOpen(true);
  }, []);

  const handleSaveVariables = async (updatedVariables: { name: string; defaultValue: string }[]) => {
    try {
      const variablesObject = updatedVariables.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultValue;
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`/api/flows/updateFlowVariables?flowId=${flowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flowId, variables: variablesObject }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setFlowVariables(updatedVariables);
        setToastMessage('Flow variables updated successfully');
      } else {
        setToastMessage('Failed to update flow variables');
      }
    } catch (error) {
      setToastMessage('Error updating flow variables');
      console.error('Error updating flow variables', error);
    }
    setToastOpen(true);
  };

  useEffect(() => {
    if (flowId) {
      fetchNodes(flowId as string).then((data: any[]) => {
        const customNodes = data.map((node) => {
          const safeNode: CustomNodeData = {
            id: node._id || `node-${Math.random().toString(36).substr(2, 9)}`,
            position: node.position || { x: 0, y: 0 },
            actions: Array.isArray(node.actions) ? node.actions : [],
            conditions: Array.isArray(node.conditions) ? node.conditions : [],
            flow: node.flow || '',
            label: node.label || '',
            type: node.type || 'default',
            waitAnswer: node.waitAnswer || false,
            updatedAt: node.updatedAt || new Date().toISOString(),
            url: node.url,
            method: node.method,
            body: node.body,
            headers: node.headers,
            language: node.language,
            query: node.query,
          };

          return {
            id: safeNode.id,
            type: node.type === 'start' ? 'startNode' : node.type === 'end' ? 'stopNode' : node.type === 'httpRequest' ? 'httpRequestNode' : node.type === 'intelligence' ? 'intelligenceNode' : 'customNode',
            position: safeNode.position,
            data: safeNode,
          };
        });
        console.log(customNodes);
        setNodes(customNodes);

        const newEdges: Edge[] = data.flatMap((node) => {
          if (Array.isArray(node.conditions)) {
            return node.conditions.map((condition: any) => ({
              id: `${node._id}-${condition.nextNode}`,
              source: node._id,
              target: condition.nextNode,
              type: 'custom',
              deletable: false,
              data: { label: condition.action },
            }));
          }
          return [];
        });
        setEdges(newEdges);
      }).catch(error => {
        console.error('Error fetching nodes:', error);
      });
    }
  }, [flowId, setNodes, setEdges]);

  return (
    <ToastProvider swipeDirection="right">
      <div className="w-full relative" style={{ height: 'calc(100vh - 20vh)' }}>
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode="dark"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
          {/* <MiniMap /> */}
          <Toolbar.Root className="absolute top-2 left-2 z-10 flex flex-col gap-2" data-orientation="vertical">

            <IconButton onClick={handleSave} aria-label="Save flow" className="bg-[#1a1a1a] border-2 border-[#54428e] cursor-pointer">
              <FaRegSave className="w-4 h-4" />
            </IconButton>
            
            <IconButton onClick={handleAddNode} aria-label="Add node" className="bg-[#1a1a1a] border-2 border-[#54428e] cursor-pointer">
              <FaPlus className="w-4 h-4" />
            </IconButton>
            
            <IconButton onClick={handleOpenConfigModal} aria-label="Configure flow" className="bg-[#1a1a1a] border-2 border-[#54428e] cursor-pointer">
              <FaCog className="w-4 h-4" />
            </IconButton>

          </Toolbar.Root>
        </ReactFlow>
        {isModalOpen && selectedNode && (
          <ActionModal
            node={selectedNode}
            actions={selectedNode.data.actions as Action[]}
            conditions={selectedNode.data.conditions as Condition[]}
            onClose={handleCloseModal}
            onSave={handleSaveActions}
            allNodes={nodes}
            onDeleteNode={onDeleteNode}
            flowVariables={flowVariables}
          />
        )}
        {isAddingNode && (
          <NodeTypeSelector
            onSelect={createNewNode}
            onCancel={() => setIsAddingNode(false)}
          />
        )}
        {isConfigModalOpen && (
          <ConfigModal
            isOpen={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            flowVariables={flowVariables}
            onSave={handleSaveVariables}
            flowId={flowId}
          />
        )}  
        <Toast open={toastOpen} onOpenChange={setToastOpen} duration={3000}>
          <div className="dark:bg-[#000009] dark:text-white dark:border-2 dark:border-[#54428e] bg-white rounded-md shadow-lg p-4 m-4">
            {toastMessage}
          </div>
        </Toast>
        <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50 outline-none" />
      </div>
    </ToastProvider>
  );
};

export default FlowEditor;