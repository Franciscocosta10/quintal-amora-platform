import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ELEMENT_ID = 'qr-reader';

// Área de leitura proporcional à câmera (70% do lado menor), para caber
// tanto na tela do celular quanto na webcam do computador.
function areaDeLeitura(largura, altura) {
  const lado = Math.floor(Math.min(largura, altura) * 0.7);
  return { width: lado, height: lado };
}

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID);
    scannerRef.current = scanner;

    let cancelled = false;
    let started = false;

    async function iniciarScanner() {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: areaDeLeitura },
          (decodedText) => {
            if (!cancelled) {
              onScan(decodedText);
            }
          },
          () => {
          }
        );

        started = true;
        if (cancelled) {
          await scanner.stop();
          scanner.clear();
        }
      } catch (err) {
        if (!cancelled) {
          onError?.(err);
        }
      }
    }

    // `void`: a função já trata os próprios erros; a promessa é descartada de propósito.
    void iniciarScanner();

    return () => {
      cancelled = true;

      if (started) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
          });
      }
    };
  }, [onScan, onError]);

  return <div id={ELEMENT_ID} className="qr-scanner" />;
}