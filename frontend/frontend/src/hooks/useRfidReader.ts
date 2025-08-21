import { useState, useEffect } from 'react';

export const useRfidReader = () => {
  const [rfidCode, setRfidCode] = useState('');
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key, 'Key code:', event.keyCode);
      
      // RFID čitači obično šalju podatke kao keystrokes
      if (event.key === 'Enter') {
        console.log('RFID reading complete:', rfidCode);
        setIsReading(false);
        // RFID kod je spreman u rfidCode state
        return;
      }
      
      // Dodaj karakter u RFID kod
      if (event.key.length === 1) {
        setIsReading(true);
        setRfidCode(prev => {
          const newCode = prev + event.key;
          console.log('Building RFID code:', newCode);
          return newCode;
        });
      }
    };

    // Reset RFID kod nakon 3 sekunde
    const resetTimer = setTimeout(() => {
      if (rfidCode && !isReading) {
        setRfidCode('');
      }
    }, 3000);

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      clearTimeout(resetTimer);
    };
  }, [rfidCode, isReading]);

  const clearRfidCode = () => {
    setRfidCode('');
    setIsReading(false);
  };

  return {
    rfidCode,
    isReading,
    clearRfidCode
  };
}; 