'use client';
import { useEffect } from 'react';
import Modal from 'react-modal';

export default function ModalSetup() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.getElementById('__next');
      if (root) {
        Modal.setAppElement(root);
      } else {
        console.warn('Modal root element #__next not found');
      }
    }
  }, []);

  return null;
}
