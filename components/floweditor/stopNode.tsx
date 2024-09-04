import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { CustomNodeData, Action, Condition } from '@/app/definitions/floweditor/definitions';
import { FaStop } from "react-icons/fa6";
import { MdOutlineCallToAction } from "react-icons/md";


type CustomNodeType = Node<CustomNodeData, 'customNode'>;

const CustomNode: React.FC<NodeProps<CustomNodeType>> = ({ data }) => {

  return (
    <div className={`rounded-md border-2 bg-[#403e3e]/30 hover:bg-[#ffc857]/20 text-white border-yellow-400 shadow-[0px_0px_30px_-15px_rgb(255,200,87)] hover:shadow-[0px_0px_30px_-10px_rgb(255,200,87)] transition-all duration-300 min-w-24 flex flex-col items-center justify-start p-4 cursor-pointer`}>
      <div className='w-full h-full p-4 rounded-[4%] bg-[#141414]'>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-center w-full mb-4">
        <div className="flex items-center justify-start w-full text-lg">
          <FaStop className="text-white w-6" /> 
          <span className="text-white font-bold ml-2">Stop</span>
        </div>
      </div>
      
      {data.actions && data.actions.length > 0 && (
        <div className="w-full py-2">
          {data.actions.map((action: Action) => (
            <div className='bg-[#141414] hover:bg-[#1a1a1a] border-2 border-[#fff]/10 p-2 rounded text-white flex items-center mb-2' key={action.id}><MdOutlineCallToAction className="w-6 mr-2" /><span>{action.type}: {action.content}</span></div>
          ))}
        </div>
      )}

      </div>
    </div>
  );
};

export default CustomNode;