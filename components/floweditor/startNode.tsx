import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { CustomNodeData, Action, Condition } from '@/app/definitions/floweditor/definitions';
import { FaPlay, FaArrowRight } from "react-icons/fa6";
import { MdOutlineCallToAction } from "react-icons/md";


type CustomNodeType = Node<CustomNodeData, 'customNode'>;

const CustomNode: React.FC<NodeProps<CustomNodeType>> = ({ data }) => {

  return (
    <div className={`rounded-[6%] border-2 text-black bg-[#403e3e]/30 hover:bg-[#0affed]/10 border-[#0affed] shadow-[0px_0px_30px_-15px_rgb(10,255,237)] hover:shadow-[0px_0px_30px_-10px_rgb(10,255,237)] transition-all duration-300 min-w-24 min-h-24 flex flex-col items-center justify-start p-4 cursor-pointer`}>
      <div className='w-full h-full p-4 rounded-[4%] bg-[#141414]'>
        <Handle type="target" position={Position.Top} />
        <div className="flex items-center justify-center w-full mb-4">
          <div className="flex items-center justify-start w-full text-lg">
            <FaPlay className="text-white w-6" /> 
            <span className="text-white font-bold ml-2">Start</span>
          </div>
        </div>
        
        {data.actions && data.actions.length > 0 && (
          <div className="w-full py-2">
            {data.actions.map((action: Action) => (
              <div className='bg-[#141414] hover:bg-[#1a1a1a] border-2 border-[#fff]/10 p-2 rounded-[6%] text-white flex items-center mb-2' key={action.id}><MdOutlineCallToAction className="w-6 mr-2" /><span>{action.type}: {action.content}</span></div>
            ))}
          </div>
        )}

        {data.conditions && data.conditions.length > 0 && (
          <>
            <div className='w-2/3 border-t-2 border-[#fff]/30'></div>
              <div className="mt-2 w-full py-2">
                {data.conditions.map((condition: Condition, index: number) => {
                  let symbol = "";

                  switch (condition.action) {
                    case 'equalType':
                    case 'true':
                      symbol = "===";
                      break;
                    case 'false':
                    case 'notEqual':
                    case 'notEqualType':
                      symbol = "!==";
                      break;
                    case 'greaterThan':
                      symbol = ">";
                      break;
                    case 'lessThan':
                      symbol = "<";
                      break;
                    case 'greaterThanOrEqual':
                      symbol = ">=";
                      break;
                    case 'lessThanOrEqual':
                      symbol = "<=";
                      break;
                  }

                  return condition.action === "default" ? (
                    <div className='bg-[#141414] hover:bg-[#1a1a1a] border-2 border-[#fff]/10 p-2 rounded-[6%] text-white flex items-center mb-2' key={index}>
                      {condition.action}: {condition.nextNode}
                    </div>
                  ) : (
                    <div className='bg-[#141414] hover:bg-[#1a1a1a] border-2 border-[#fff]/10 p-2 rounded-[6%] text-white flex items-center mb-2' key={index}> {condition.parameter1Type.charAt(0).toUpperCase() + condition.parameter1Type.slice(1)}: {condition.parameter1Value} {symbol} {condition.parameter2Type.charAt(0).toUpperCase() + condition.parameter2Type.slice(1)}: {condition.parameter2Value} <FaArrowRight className="mx-2" /> {condition.nextNode}
                    </div>
                  );
                })}
            </div>
          </>
        )} 
        
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
};

export default CustomNode;