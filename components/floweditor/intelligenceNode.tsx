import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { CustomNodeData } from '@/app/definitions/floweditor/definitions';
import { FaRobot } from "react-icons/fa";

const handleStyle = {
  width: '70px',
  padding: '0',
  height: '10px',
  background: '#fcf7ff',
  border: 'none',
  borderRadius: '20px',
  opacity: '0.9',
};

type IntelligenceNodeType = Node<CustomNodeData, 'intelligenceNode'>;

const IntelligenceNode: React.FC<NodeProps<IntelligenceNodeType>> = ({ data }) => {
  return (
    <div className={`shadow-md rounded-[6%] border-2 text-black bg-[#403e3e]/30 hover:bg-purple-400/20 hover:shadow-[0px_0px_30px_-15px_rgb(128,0,128)] transition-all duration-300 border-purple-400 w-max max-w-[90vw] lg:max-w-[30vw] min-h-28 flex flex-col items-center justify-start p-4 cursor-pointer`}>
      <div className='w-full h-full p-4 rounded-[4%] bg-[#141414]'>
      <Handle type="target" position={Position.Top} style={handleStyle}/>
      <div className="flex items-center justify-center w-full mb-4">
        <div className="flex items-center justify-start w-full text-lg">
          <FaRobot className="text-purple-400 w-6" />
          <span className="text-white font-bold ml-2">{data.label}</span>
        </div>
      </div>
      
      <div className="w-full py-2">
        <div className='bg-[#141414] hover:bg-[#1a1a1a] border-2 border-[#fff]/10 p-2 rounded-[6%] text-white flex items-center mb-2'>
          <span>Language: {data.language}</span>
        </div>
        <div className='bg-[#141414] hover:bg-[#1a1a1a] border-2 border-[#fff]/10 p-2 rounded-[6%] text-white flex items-center mb-2'>
          <span>Query: {data.query}</span>
        </div>
      </div>

      {data.conditions && data.conditions.length > 0 && (
        <>
          <div className='w-2/3 border-t-2 border-[#fff]/30'></div>
          <div className="mt-2 w-full py-2">
            {data.conditions.map((condition, index) => (
              <div className='bg-[#141414] hover:bg-[#1a1a1a] border-2 border-[#fff]/10 p-2 rounded-[6%] text-white flex items-center mb-2' key={index}>
                {condition.action}: {condition.nextNode}
              </div>
            ))}
          </div>
        </>
      )} 
      
      <Handle type="source" position={Position.Bottom} style={handleStyle}/>
      </div>  
    </div>
  );
};

export default IntelligenceNode;