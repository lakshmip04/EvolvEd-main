import React, { useRef, useState, useEffect } from 'react';

const colors = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080FF', '#004080', '#8000FF', '#804000',
  '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF80', '#00FF80', '#80FFFF', '#8080FF', '#FF0080', '#FF8040'
];

const Paint = ({ onClose, isPage = false }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('brush');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      context.lineTo(x, y);
      context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      context.lineWidth = tool === 'eraser' ? 20 : 2;
      context.lineCap = 'round';
      context.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const startDragging = (e) => {
    setDragging(true);
    setPosition({
      x: e.clientX - (containerRef.current?.offsetLeft || 0),
      y: e.clientY - (containerRef.current?.offsetTop || 0)
    });
  };

  const onDrag = (e) => {
    if (dragging) {
      const left = e.clientX - position.x;
      const top = e.clientY - position.y;
      if (containerRef.current) {
        containerRef.current.style.left = `${left}px`;
        containerRef.current.style.top = `${top}px`;
      }
    }
  };

  const stopDragging = () => {
    setDragging(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const containerClasses = isPage 
    ? "w-full bg-gray-200 border-2 border-white shadow-md" 
    : "absolute bg-gray-200 border-2 border-white shadow-md";

  const wrapperClasses = isPage 
    ? "" 
    : "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";

  return (
    <div className={wrapperClasses}>
      <div 
        ref={containerRef}
        className={containerClasses}
        style={!isPage ? { width: '800px' } : {}}
      >
        <div 
          className="bg-blue-900 text-white px-2 py-1 flex justify-between items-center cursor-move"
          onMouseDown={!isPage ? startDragging : undefined}
          onMouseMove={!isPage ? onDrag : undefined}
          onMouseUp={!isPage ? stopDragging : undefined}
          onMouseLeave={!isPage ? stopDragging : undefined}
        >
          <span>untitled - Paint</span>
          {!isPage && (
            <div className="flex gap-1">
              <button className="h-5 w-5 p-0 text-white hover:bg-blue-700">_</button>
              <button className="h-5 w-5 p-0 text-white hover:bg-blue-700">□</button>
              <button 
                className="h-5 w-5 p-0 text-white hover:bg-blue-700"
                onClick={handleClose}
              >×</button>
            </div>
          )}
        </div>
        <div className="bg-gray-300 px-2 py-1 text-sm">
          <span className="mr-4">File</span>
          <span className="mr-4">Edit</span>
          <span className="mr-4">View</span>
          <span className="mr-4">Image</span>
          <span className="mr-4">Options</span>
          <span>Help</span>
        </div>
        <div className="flex">
          <div className="w-8 bg-gray-300 p-0.5 border-r border-gray-400">
            <button
              className={`w-7 h-7 p-0 min-w-0 mb-0.5 ${tool === 'brush' ? 'bg-gray-300 border border-gray-400 shadow-inner' : ''}`}
              onClick={() => setTool('brush')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 12l-8-8-6 6c-2 2-2 5 0 7s5 2 7 0l7-7" />
                <path d="M17 7l3 3" />
              </svg>
            </button>
            <button
              className={`w-7 h-7 p-0 min-w-0 mb-0.5 ${tool === 'eraser' ? 'bg-gray-300 border border-gray-400 shadow-inner' : ''}`}
              onClick={() => setTool('eraser')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z" />
                <path d="M17 17L7 7" />
              </svg>
            </button>
          </div>
          <div className="flex-grow overflow-auto border border-gray-400" style={isPage ? { height: '600px' } : { width: '724px', height: '500px' }}>
            <canvas
              ref={canvasRef}
              width={2000}
              height={2000}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
          </div>
        </div>
        <div className="flex bg-gray-300 p-1 border-t border-gray-400">
          <div className="flex flex-wrap gap-1">
            {colors.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 p-0 min-w-0 ${color === c ? 'ring-1 ring-gray-600' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <div className="bg-gray-300 px-2 py-1 text-sm border-t border-gray-400">
          <div className="flex justify-between">
            <span>For Help, click Help Topics on the Help Menu.</span>
            {!isPage && (
              <button 
                onClick={handleClose}
                className="text-blue-600 hover:text-blue-800"
              >
                Close Paint
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paint; 