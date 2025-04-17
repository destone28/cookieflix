// src/modules/categories/CategoryEdit.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import CategoryForm from './CategoryForm';

const CategoryEdit = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl text-gray-800 font-bold mb-1">Modifica Categoria</h1>
        <div className="text-sm font-medium">
          <Link to="/categories" className="text-blue-500 hover:text-blue-600">
            ← Torna alla lista categorie
          </Link>
        </div>
      </div>

      {/* Form component */}
      <CategoryForm />
    </div>
  );
};

export default CategoryEdit;