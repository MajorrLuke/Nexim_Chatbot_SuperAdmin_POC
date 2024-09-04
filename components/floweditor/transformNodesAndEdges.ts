import { NodeData } from '@/app/definitions/floweditor/definitions';
import { Node } from '@xyflow/react';
import { getIncomers } from '@xyflow/react';

export const transformNodesAndEdges = (nodes: NodeData[]): { nodes: Node[], edges: any[] } => {
  console.log('Received nodes:', nodes);
  const transformedNodes = nodes.map(node => ({
    id: node._id?.toString() || '',
    data: { label: node.name, actions: node.actions },
    position: { x: Math.random() * 250, y: Math.random() * 250 },
    type: node.type,
    onconnect: false,
  }));

  const edges = nodes.flatMap(node => {
    const edges = [];
    if (node.nextnode) {
      edges.push({
        type: 'smoothstep',
        animated: true,
        id: `${node._id?.toString()}-${node.nextnode.toString()}`,
        source: node._id?.toString(),
        target: node.nextnode.toString(),
      });
    }
    return edges;
  });

  console.log('Edges:', edges);

  return { nodes: transformedNodes, edges };
};