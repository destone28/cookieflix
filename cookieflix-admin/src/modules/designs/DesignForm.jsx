// src/modules/designs/DesignForm.jsx
import { useState, useEffect, useRef } from 'react';
import { getCategories } from '../../services/categoryService';
import { uploadDesignMainImage, uploadDesignAdditionalImage, uploadDesignModel } from '../../services/designService';

const DesignForm = ({ initialValues, loading, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState(initialValues);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState({
    main: false,
    additional1: false,
    additional2: false,
    model: false
  });
  
  // Refs per gli input di file
  const mainImageRef = useRef(null);
  const additionalImage1Ref = useRef(null);
  const additionalImage2Ref = useRef(null);
  const modelRef = useRef(null);

  // Carica categorie
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getCategories({ pageSize: 100, status: 'active' });
        setCategories(response.categories);
      } catch (err) {
        console.error("Errore nel caricamento delle categorie:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Gestione cambiamenti nei campi di input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Reset degli errori quando l'utente modifica un campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Upload immagine principale
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione: solo immagini
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        image_url: 'Il file deve essere un\'immagine (JPEG, PNG, GIF, WEBP)'
      });
      return;
    }

    setUploadLoading({ ...uploadLoading, main: true });
    try {
      // In un'applicazione reale, qui caricheremmo l'immagine sul server
      // Simuliamo creando un URL locale per l'anteprima
      const imageUrl = URL.createObjectURL(file);
      
      // Per il design esistente, invocheremmo l'API di upload
      if (isEditing && formData.id) {
        // Decommentare in produzione:
        // const response = await uploadDesignMainImage(formData.id, file);
        // const imageUrl = response.image_url;
      }
      
      setFormData({
        ...formData,
        image_url: imageUrl,
        mainImageFile: file // Memorizza il file per l'invio finale
      });
      
      setErrors({
        ...errors,
        image_url: null
      });
    } catch (err) {
      console.error("Errore nell'upload dell'immagine principale:", err);
      setErrors({
        ...errors,
        image_url: "Errore nell'upload dell'immagine. Riprova."
      });
    } finally {
      setUploadLoading({ ...uploadLoading, main: false });
    }
  };

  // Upload immagine aggiuntiva
  const handleAdditionalImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione: solo immagini
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        [`additional_image_${index}`]: 'Il file deve essere un\'immagine (JPEG, PNG, GIF, WEBP)'
      });
      return;
    }

    setUploadLoading({ 
      ...uploadLoading, 
      [index === 0 ? 'additional1' : 'additional2']: true 
    });
    
    try {
      // Simuliamo creando un URL locale per l'anteprima
      const imageUrl = URL.createObjectURL(file);
      
      // Per il design esistente, invocheremmo l'API di upload
      if (isEditing && formData.id) {
        // Decommentare in produzione:
        // const response = await uploadDesignAdditionalImage(formData.id, file, index);
        // const imageUrl = response.image_url;
      }
      
      const additionalImages = [...(formData.additional_images || [])];
      // Aggiorna o aggiungi l'immagine all'indice specificato
      if (index < additionalImages.length) {
        additionalImages[index] = imageUrl;
      } else {
        additionalImages.push(imageUrl);
      }
      
      setFormData({
        ...formData,
        additional_images: additionalImages,
        [`additionalImageFile${index + 1}`]: file // Memorizza il file per l'invio finale
      });
      
      setErrors({
        ...errors,
        [`additional_image_${index}`]: null
      });
    } catch (err) {
      console.error(`Errore nell'upload dell'immagine aggiuntiva ${index + 1}:`, err);
      setErrors({
        ...errors,
        [`additional_image_${index}`]: "Errore nell'upload dell'immagine. Riprova."
      });
    } finally {
      setUploadLoading({ 
        ...uploadLoading, 
        [index === 0 ? 'additional1' : 'additional2']: false 
      });
    }
  };

  // Upload modello 3D
  const handleModelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione: solo files STL
    if (file.name.split('.').pop().toLowerCase() !== 'stl') {
      setErrors({
        ...errors,
        model_url: 'Il file deve essere un modello STL'
      });
      return;
    }

    setUploadLoading({ ...uploadLoading, model: true });
    try {
      // In un'applicazione reale, qui caricheremmo il modello sul server
      // Simuliamo creando un nome file fittizio
      const modelUrl = `/models/${file.name}`;
      
      // Per il design esistente, invocheremmo l'API di upload
      if (isEditing && formData.id) {
        // Decommentare in produzione:
        // const response = await uploadDesignModel(formData.id, file);
        // const modelUrl = response.model_url;
      }
      
      setFormData({
        ...formData,
        model_url: modelUrl,
        modelFile: file // Memorizza il file per l'invio finale
      });
      
      setErrors({
        ...errors,
        model_url: null
      });
    } catch (err) {
      console.error("Errore nell'upload del modello:", err);
      setErrors({
        ...errors,
        model_url: "Errore nell'upload del modello. Riprova."
      });
    } finally {
      setUploadLoading({ ...uploadLoading, model: false });
    }
  };

  // Rimuovi immagine principale
  const handleRemoveMainImage = () => {
    setFormData({
      ...formData,
      image_url: '',
      mainImageFile: null
    });
    
    // Reset del campo di input file
    if (mainImageRef.current) {
      mainImageRef.current.value = '';
    }
  };

  // Rimuovi immagine aggiuntiva
  const handleRemoveAdditionalImage = (index) => {
    const additionalImages = [...(formData.additional_images || [])];
    additionalImages.splice(index, 1);
    
    setFormData({
      ...formData,
      additional_images: additionalImages,
      [`additionalImageFile${index + 1}`]: null
    });
    
    // Reset del campo di input file
    if (index === 0 && additionalImage1Ref.current) {
      additionalImage1Ref.current.value = '';
    } else if (index === 1 && additionalImage2Ref.current) {
      additionalImage2Ref.current.value = '';
    }
  };

  // Rimuovi modello
  const handleRemoveModel = () => {
    setFormData({
      ...formData,
      model_url: '',
      modelFile: null
    });
    
    // Reset del campo di input file
    if (modelRef.current) {
      modelRef.current.value = '';
    }
  };

  // Validazione del form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'La categoria è obbligatoria';
    }
    
    if (!formData.image_url) {
      newErrors.image_url = "L'immagine principale è obbligatoria";
    }
    
    if (!formData.model_url) {
      newErrors.model_url = 'Il modello 3D è obbligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit del form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepara i dati da inviare (escludendo i file locali)
    const { mainImageFile, additionalImageFile1, additionalImageFile2, modelFile, ...dataToSubmit } = formData;
    
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      {/* Nome e Descrizione */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Nome del design"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
            disabled={loading || categoriesLoading}
          >
            <option value="">Seleziona una categoria</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrizione <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Descrizione dettagliata del design"
          disabled={loading}
        ></textarea>
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
      
      {/* Stato (Attivo/Inattivo) */}
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={loading}
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Design attivo
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          I design attivi sono visibili agli utenti e possono essere votati
        </p>
      </div>
      
      {/* Immagine Principale */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Immagine Principale <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex items-center">
          <div className="w-full flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {formData.image_url ? (
              <div className="w-full">
                <div className="relative w-full h-48 mb-3">
                  <img
                    src={formData.image_url}
                    alt="Anteprima immagine principale"
                    className="h-full mx-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMainImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-center">
                  <span className="text-sm text-gray-500 truncate">
                    {formData.mainImageFile ? formData.mainImageFile.name : "Immagine caricata"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="main-image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Carica un'immagine</span>
                    <input
                      id="main-image-upload"
                      ref={mainImageRef}
                      name="main-image-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleMainImageUpload}
                      accept="image/*"
                      disabled={loading || uploadLoading.main}
                    />
                  </label>
                  <p className="pl-1">o trascina e rilascia</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF fino a 10MB</p>
              </div>
            )}
          </div>
        </div>
        {uploadLoading.main && (
          <div className="mt-2 flex items-center text-sm text-blue-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Caricamento in corso...
          </div>
        )}
        {errors.image_url && (
          <p className="mt-1 text-sm text-red-500">{errors.image_url}</p>
        )}
      </div>
      
      {/* Immagini Aggiuntive */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Immagini Aggiuntive (massimo 2)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Immagine Aggiuntiva 1 */}
          <div className="mt-1 flex items-center">
            <div className="w-full flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              {formData.additional_images && formData.additional_images[0] ? (
                <div className="w-full">
                  <div className="relative w-full h-40 mb-3">
                    <img
                      src={formData.additional_images[0]}
                      alt="Anteprima immagine aggiuntiva 1"
                      className="h-full mx-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(0)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-sm text-gray-500 truncate">
                      {formData.additionalImageFile1 ? formData.additionalImageFile1.name : "Immagine aggiuntiva 1"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="additional-image-1-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Carica immagine</span>
                      <input
                        id="additional-image-1-upload"
                        ref={additionalImage1Ref}
                        name="additional-image-1-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleAdditionalImageUpload(e, 0)}
                        accept="image/*"
                        disabled={loading || uploadLoading.additional1}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Immagine Aggiuntiva 2 */}
          <div className="mt-1 flex items-center">
            <div className="w-full flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              {formData.additional_images && formData.additional_images[1] ? (
                <div className="w-full">
                  <div className="relative w-full h-40 mb-3">
                    <img
                      src={formData.additional_images[1]}
                      alt="Anteprima immagine aggiuntiva 2"
                      className="h-full mx-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(1)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-sm text-gray-500 truncate">
                      {formData.additionalImageFile2 ? formData.additionalImageFile2.name : "Immagine aggiuntiva 2"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="additional-image-2-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Carica immagine</span>
                      <input
                        id="additional-image-2-upload"
                        ref={additionalImage2Ref}
                        name="additional-image-2-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleAdditionalImageUpload(e, 1)}
                        accept="image/*"
                        disabled={loading || uploadLoading.additional2}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {(uploadLoading.additional1 || uploadLoading.additional2) && (
          <div className="mt-2 flex items-center text-sm text-blue-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Caricamento in corso...
          </div>
        )}
      </div>
      
      {/* Modello 3D */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Modello 3D (STL) <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex items-center">
          <div className="w-full flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {formData.model_url ? (
              <div className="w-full text-center">
                <div className="mx-auto w-16 h-16 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="font-medium text-blue-600">
                  Modello caricato
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {formData.model_url.split('/').pop()}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveModel}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50"
                  disabled={loading}
                >
                  Rimuovi
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="model-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Carica un modello STL</span>
                    <input
                      id="model-upload"
                      ref={modelRef}
                      name="model-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleModelUpload}
                      accept=".stl"
                      disabled={loading || uploadLoading.model}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">File STL fino a 50MB</p>
              </div>
            )}
          </div>
        </div>
        {uploadLoading.model && (
          <div className="mt-2 flex items-center text-sm text-blue-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Caricamento in corso...
          </div>
        )}
        {errors.model_url && (
          <p className="mt-1 text-sm text-red-500">{errors.model_url}</p>
        )}
      </div>
      
      {/* Pulsanti di Azione */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          disabled={loading}
        >
          Annulla
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditing ? 'Aggiornamento...' : 'Creazione...'}
            </>
          ) : (
            isEditing ? 'Aggiorna Design' : 'Crea Design'
          )}
        </button>
      </div>
    </form>
  );
};

export default DesignForm;