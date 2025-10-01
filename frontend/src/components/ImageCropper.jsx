import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { X, Check } from 'lucide-react';

export function ImageCropper({ imageUrl, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to fit container
      const maxWidth = 500;
      const maxHeight = 400;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      setImageSize({ width: canvas.width, height: canvas.height });
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw crop overlay
      drawCropOverlay(ctx);
    };
    img.src = imageUrl;
  }, [imageUrl, cropArea]);

  const drawCropOverlay = (ctx) => {
    const { width, height } = imageSize;
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Clear crop area
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Redraw image in crop area
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(
        img,
        (cropArea.x / width) * img.naturalWidth,
        (cropArea.y / height) * img.naturalHeight,
        (cropArea.width / width) * img.naturalWidth,
        (cropArea.height / height) * img.naturalHeight,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height
      );
      
      // Crop border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Resize handles
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      // Top-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
      // Top-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
      // Bottom-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
      // Bottom-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
    };
    img.src = imageUrl;
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const handleSize = 8;
    
    // Check resize handles
    if (Math.abs(x - cropArea.x) <= handleSize && Math.abs(y - cropArea.y) <= handleSize) {
      setIsDragging('nw-resize');
    } else if (Math.abs(x - (cropArea.x + cropArea.width)) <= handleSize && Math.abs(y - cropArea.y) <= handleSize) {
      setIsDragging('ne-resize');
    } else if (Math.abs(x - cropArea.x) <= handleSize && Math.abs(y - (cropArea.y + cropArea.height)) <= handleSize) {
      setIsDragging('sw-resize');
    } else if (Math.abs(x - (cropArea.x + cropArea.width)) <= handleSize && Math.abs(y - (cropArea.y + cropArea.height)) <= handleSize) {
      setIsDragging('se-resize');
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
               y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging('move');
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging === 'move') {
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;
      const maxX = imageSize.width - cropArea.width;
      const maxY = imageSize.height - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }));
    } else {
      // Handle resizing
      setCropArea(prev => {
        let newArea = { ...prev };
        
        if (isDragging.includes('n')) {
          const newHeight = prev.height + (prev.y - y);
          if (newHeight > 20 && y >= 0) {
            newArea.y = y;
            newArea.height = newHeight;
          }
        }
        if (isDragging.includes('s')) {
          const newHeight = y - prev.y;
          if (newHeight > 20 && y <= imageSize.height) {
            newArea.height = newHeight;
          }
        }
        if (isDragging.includes('w')) {
          const newWidth = prev.width + (prev.x - x);
          if (newWidth > 20 && x >= 0) {
            newArea.x = x;
            newArea.width = newWidth;
          }
        }
        if (isDragging.includes('e')) {
          const newWidth = x - prev.x;
          if (newWidth > 20 && x <= imageSize.width) {
            newArea.width = newWidth;
          }
        }
        
        return newArea;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const getCursor = (e) => {
    if (!canvasRef.current) return 'default';
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const handleSize = 8;
    
    if (Math.abs(x - cropArea.x) <= handleSize && Math.abs(y - cropArea.y) <= handleSize) {
      return 'nw-resize';
    } else if (Math.abs(x - (cropArea.x + cropArea.width)) <= handleSize && Math.abs(y - cropArea.y) <= handleSize) {
      return 'ne-resize';
    } else if (Math.abs(x - cropArea.x) <= handleSize && Math.abs(y - (cropArea.y + cropArea.height)) <= handleSize) {
      return 'sw-resize';
    } else if (Math.abs(x - (cropArea.x + cropArea.width)) <= handleSize && Math.abs(y - (cropArea.y + cropArea.height)) <= handleSize) {
      return 'se-resize';
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
               y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'move';
    }
    return 'default';
  };

  const applyCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const scaleX = img.naturalWidth / imageSize.width;
      const scaleY = img.naturalHeight / imageSize.height;
      
      canvas.width = cropArea.width * scaleX;
      canvas.height = cropArea.height * scaleY;
      
      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      canvas.toBlob(onCrop, 'image/png');
    };
    img.src = imageUrl;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-300"
            style={{ cursor: isDragging ? (isDragging === 'move' ? 'move' : isDragging) : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => {
              handleMouseMove(e);
              if (!isDragging) {
                e.target.style.cursor = getCursor(e);
              }
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={applyCrop}>
            <Check className="h-4 w-4 mr-1" />
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}