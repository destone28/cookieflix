// src/components/layout/Sidebar.jsx
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  FolderIcon,
  CubeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Definizione delle voci di navigazione
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Utenti', href: '/users', icon: UsersIcon },
  { name: 'Abbonamenti', href: '/subscriptions', icon: CreditCardIcon },
  { name: 'Categorie', href: '/categories', icon: FolderIcon },
  { name: 'Design', href: '/designs', icon: CubeIcon },
  { name: 'Impostazioni', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-dark-text bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-dark-bg">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Chiudi sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-shrink-0 flex items-center px-4">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Cookieflix Admin"
                />
                <span className="ml-2 text-xl font-bold text-white">Cookieflix Admin</span>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-light-text hover:bg-dark-bg hover:bg-opacity-75'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      >
                        <item.icon
                          className={`${
                            isActive ? 'text-white' : 'text-light-text group-hover:text-white'
                          } mr-4 flex-shrink-0 h-6 w-6`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Spacer element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-dark-bg">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Cookieflix Admin"
              />
              <span className="ml-2 text-xl font-bold text-white">Cookieflix Admin</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-dark-bg space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-light-text hover:bg-dark-bg hover:bg-opacity-75'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-white' : 'text-light-text group-hover:text-white'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;