// src/modules/designs/DesignEdit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDesignById, updateDesign } from '../../services/designService';
import DesignForm from './DesignForm';

const DesignEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDesign = async () => {
      setLoading(true);
      try {
        const data = await getDesignById(id);
        setDesign(data);
        setError(null);
      } catch (err) {
        console.error('Errore nel caricamento del design:', err);
        setError('Impossibile caricare il design. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [id]);

  const handleSubmit = async (designData) => {
    setSubmitLoading(true);
    setError(null);
    
    try {
      await updateDesign(id, designData);
      navigate('/designs');
    } catch (err) {
      console.error('Errore nell\'aggiornamento del design:', err);
      setError('Si è verificato un errore durante l\'aggiornamento del design. Riprova.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !design) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={() => navigate('/designs')}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Torna alla lista
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Modifica Design</h1>
        <p className="text-gray-600">Modifica i dettagli del design "{design?.name}"</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <DesignForm 
        initialValues={design}
        loading={submitLoading} 
        onSubmit={handleSubmit} 
        onCancel={() => navigate('/designs')}
        isEditing={true}
      />
    </div>
  );
};

export default DesignEdit;