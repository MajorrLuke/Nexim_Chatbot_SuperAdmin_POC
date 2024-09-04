interface NeximEchoCircleProps {
  className?: string;
}

export function NeximEchoCircle1({ className = '' }: NeximEchoCircleProps) {
  return (
    <div className={`${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[100%] h-[100%] bg-[#54428e]/20 rounded-full flex items-center justify-center">
          <div className="w-[83.33%] h-[83.33%] bg-[#54428e]/30 rounded-full flex items-center justify-center">
            <div className="w-[80%] h-[80%] bg-[#54428e]/40 rounded-full flex items-center justify-center">
              <div className="w-[75%] h-[75%] bg-[#54428e]/50 rounded-full flex items-center justify-center">
                <div className="w-[66.67%] h-[66.67%] bg-[#54428e]/60 rounded-full flex items-center justify-center">
                  <div className="w-[50%] h-[50%] bg-[#54428e/80 rounded-full flex items-center justify-center">
                    <div className="w-[50%] h-[50%] bg-[#54428e] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NeximEchoCircle2({ className = '' }: NeximEchoCircleProps) {
    return (
      <div className={`${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[100%] h-[100%] bg-[#0affed]/20 rounded-full flex items-center justify-center">
            <div className="w-[83.33%] h-[83.33%] bg-[#0affed]/30 rounded-full flex items-center justify-center">
              <div className="w-[80%] h-[80%] bg-[#0affed]/40 rounded-full flex items-center justify-center">
                <div className="w-[75%] h-[75%] bg-[#0affed]/50 rounded-full flex items-center justify-center">
                  <div className="w-[66.67%] h-[66.67%] bg-[#0affed]/60 rounded-full flex items-center justify-center">
                    <div className="w-[50%] h-[50%] bg-[#0affed]/80 rounded-full flex items-center justify-center">
                      <div className="w-[50%] h-[50%] bg-[#0affed] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }