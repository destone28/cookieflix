// src/modules/categories/CategoryForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryById, createCategory, updateCategory, uploadCategoryImage } from '../../services/categoryService';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (isEditing) {
        setLoading(true);
        try {
          const category = await getCategoryById(id);
          setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            image_url: category.image_url || '',
            is_active: category.is_active !== undefined ? category.is_active : true
          });
          if (category.image_url) {
            setImagePreview(category.image_url);
          }
        } catch (error) {
          console.error('Error fetching category:', error);
          alert('Errore nel recupero della categoria. Riprova più tardi.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategory();
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Lo slug è obbligatorio';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Lo slug deve contenere solo lettere minuscole, numeri e trattini';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({ ...prev, slug }));
      if (errors.slug) {
        setErrors(prev => ({ ...prev, slug: undefined }));
      }
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      alert('Per favore, seleziona un file immagine valido (JPEG, PNG, GIF, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'immagine è troppo grande. Il limite è di 5MB.');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let savedCategory;
      
      if (isEditing) {
        // Update existing category
        savedCategory = await updateCategory(id, formData);
      } else {
        // Create new category
        savedCategory = await createCategory(formData);
      }
      
      // If we have a new image, upload it
      if (imageFile) {
        setImageLoading(true);
        try {
          await uploadCategoryImage(savedCategory.id, imageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('La categoria è stata salvata ma si è verificato un errore durante il caricamento dell\'immagine. Puoi riprovare a caricare l\'immagine successivamente.');
        } finally {
          setImageLoading(false);
        }
      }
      
      // Success - redirect to list
      navigate('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Errore durante il salvataggio della categoria. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Modifica Categoria' : 'Nuova Categoria'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full rounded-md ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Nome della categoria"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          {/* Slug Field with Generate Button */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`block w-full rounded-md ${
                  errors.slug ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="slug-della-categoria"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Genera
              </button>
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Lo slug viene utilizzato negli URL e deve essere unico. Usa solo lettere minuscole, numeri e trattini.
            </p>
          </div>
          
          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className={`block w-full rounded-md ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Descrizione della categoria"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          {/* Image Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Immagine
            </label>
            <div className="mt-1 flex items-center">
              {imagePreview && (
                <div className="relative mr-4">
                  <img
                    src={imagePreview}
                    alt="Anteprima"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                {imagePreview ? 'Cambia immagine' : 'Carica immagine'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Formati supportati: JPG, PNG, GIF. Dimensione massima: 5MB.
            </p>
          </div>
          
          {/* Active Status */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="is_active" className="font-medium text-gray-700">
                Categoria attiva
              </label>
              <p className="text-gray-500">
                Se deselezionato, la categoria non sarà visibile agli utenti
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading || imageLoading}
            className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {(loading || imageLoading) && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Salvataggio...' : 'Salva Categoria'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;