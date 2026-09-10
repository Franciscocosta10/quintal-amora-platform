import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ELEMENT_ID = 'qr-reader';

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
          { fps: 10, qrbox: 250 },
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

    iniciarScanner();

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