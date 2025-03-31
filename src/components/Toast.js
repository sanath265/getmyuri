import { useState, useEffect } from 'react';
import '../styles/toast.css';

function Toast({ message, duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${isVisible ? 'show' : ''}`}>
      {message}
    </div>
  );
}

export default Toast; 