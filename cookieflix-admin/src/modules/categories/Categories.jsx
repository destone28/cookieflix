// src/modules/categories/Categories.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryList from './CategoryList';
import { getCategoryStats } from '../../services/categoryService';

const Categories = () => {
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    mostPopularCategories: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getCategoryStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching category stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 font-bold">Gestione Categorie</h1>
          <p className="text-gray-600 mt-1">
            Gestisci le categorie per i design di cookie cutters
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          <Link
            to="/categories/create"
            className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Nuova Categoria</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {loadingStats ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalCategories
                )}
              </div>
              <div className="text-sm font-medium text-gray-500">Totale Categorie</div>
            </div>
            <div className="text-blue-500 bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {loadingStats ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.activeCategories
                )}
              </div>
              <div className="text-sm font-medium text-gray-500">Categorie Attive</div>
            </div>
            <div className="text-green-500 bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {loadingStats ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalCategories - stats.activeCategories
                )}
              </div>
              <div className="text-sm font-medium text-gray-500">Categorie Inattive</div>
            </div>
            <div className="text-red-500 bg-red-100 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Most Popular Categories */}
      {!loadingStats && stats.mostPopularCategories && stats.mostPopularCategories.length > 0 && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Categorie Più Popolari</h3>
          </div>
          <div className="p-3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
                  <tr>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-left">Nome</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Design</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Voti</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {stats.mostPopularCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="font-medium text-gray-800">
                            <Link to={`/categories/${category.id}/edit`} className="hover:text-blue-600">
                              {category.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center">{category.designs_count}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-center text-green-500 font-medium">{category.votes_count}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <CategoryList />
    </div>
  );
};

export default Categories;