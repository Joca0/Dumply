// frontend/src/components/ui/MainAlert.jsx
import React, { createContext, useState, useContext } from 'react';
import GlassAlert from './CustomAlert.jsx';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: null
    });

    const showAlert = (title, message) => {
        setAlertConfig({ isOpen: true, title, message, type: 'alert', onConfirm: null });
    };

    const showConfirm = (title, message, onConfirm) => {
        setAlertConfig({ isOpen: true, title, message, type: 'confirm', onConfirm });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <GlassAlert
                isOpen={alertConfig.isOpen}
                onClose={hideAlert}
                onConfirm={alertConfig.onConfirm}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);