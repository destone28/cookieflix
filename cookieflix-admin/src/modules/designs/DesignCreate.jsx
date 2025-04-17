// src/modules/designs/DesignCreate.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDesign } from '../../services/designService';
import DesignForm from './DesignForm';

const DesignCreate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (designData) => {
    setLoading(true);
    setError(null);
    
    try {
      await createDesign(designData);
      navigate('/designs');
    } catch (err) {
      console.error('Errore nella creazione del design:', err);
      setError('Si è verificato un errore durante la creazione del design. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Crea Nuovo Design</h1>
        <p className="text-gray-600">Compila il form per creare un nuovo design di cookie cutter</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <DesignForm 
        initialValues={{
          name: '',
          description: '',
          category_id: '',
          is_active: true,
          image_url: '',
          additional_images: [],
          model_url: ''
        }}
        loading={loading} 
        onSubmit={handleSubmit} 
        onCancel={() => navigate('/designs')}
      />
    </div>
  );
};

export default DesignCreate;