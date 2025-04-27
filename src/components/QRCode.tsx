
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  level?: string;
  bgColor?: string;
  fgColor?: string;
  id?: string;
}

export const QRCodeCanvas: React.FC<QRCodeProps> = ({
  value,
  size = 128,
  level = 'L',
  bgColor = '#ffffff',
  fgColor = '#000000',
  id
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 4,
          errorCorrectionLevel: level as any,
          color: {
            dark: fgColor,
            light: bgColor
          }
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [value, size, level, bgColor, fgColor]);

  return (
    <canvas id={id} ref={canvasRef} width={size} height={size} />
  );
};
