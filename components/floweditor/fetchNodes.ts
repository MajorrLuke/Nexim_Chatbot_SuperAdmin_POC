import { CustomNodeData } from '@/app/definitions/floweditor/definitions';

export const fetchNodes = async (flowId: string): Promise<CustomNodeData[]> => {
  const response = await fetch(`/api/flows/fetchNodes?flowId=${flowId}`);
  const data = await response.json();
  //console.log('data', data);
  return data;
};