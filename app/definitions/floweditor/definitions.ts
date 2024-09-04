import { Node } from 'reactflow';
import { ObjectId } from 'mongodb';

export interface NodeData {
    _id: { buffer: Buffer };
    name: string;
    type: string;
    actions: { id: number; type: string; content: string }[];
    nextnode?: { buffer: Buffer };
    previousnode?: { buffer: Buffer };
}

export interface FlowEditorProps {
    params: {
      flowId: string;
    };
}

export interface Action {
    id: number;
    type: string;
    content: string;
}

export interface Condition {
  action: string;
  parameter1Type: 'variable' | 'custom';
  parameter1Value: string;
  parameter2Type: 'variable' | 'custom';
  parameter2Value: string;
  nextNode: string;
}

export interface CustomNodeData {
  id: string;
  flow: string;
  label: string;
  type: string;
  actions: Action[];
  conditions?: Condition[];
  position: {
    x: number;
    y: number;
  };
  waitAnswer: boolean;
  updatedAt: string;
  url?: string;
  method?: string;
  body?: string;
  headers?: { [key: string]: string };
  tempImageFiles?: { [key: string]: globalThis.File };
  language?: string;
  query?: string;
  [key: string]: unknown;
}

export interface ActionModalProps {
  node: Node<CustomNodeData>;
  actions: Action[];
  conditions: Condition[];
  onClose: () => void;
  onSave: (label: string, updatedActions: Action[], updatedConditions: Condition[], waitAnswer: boolean, nodeData: Partial<CustomNodeData>, imagesToDelete: string[]) => void;
  allNodes: Node<CustomNodeData>[];
  onDeleteNode: (nodeId: string) => void;
  flowVariables: { name: string; defaultValue: string }[];
}

export interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowVariables: { name: string; defaultValue: string }[];
  onSave: (variables: { name: string; defaultValue: string }[]) => void;
  flowId: string | number;
}

export interface File {
  _id: ObjectId;
  filename: string;
  fileType: string;
  content: string;
  uploadDate: Date;
  status: string;
  tenant: number;
}