import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const BackButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center mb-4 text-gray-600 hover:text-primary font-semibold transition-colors duration-200"
        >
            <ArrowLeftIcon />
            Kembali
        </button>
    );
};

export default BackButton;
