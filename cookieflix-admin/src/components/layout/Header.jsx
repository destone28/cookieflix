// src/components/layout/Header.jsx
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = ({ setSidebarOpen }) => {
  const { logout } = useAuth();
  
  const userNavigation = [
    { name: 'Il tuo profilo', href: '/profile' },
    { name: 'Impostazioni', href: '/settings' },
    { name: 'Esci', href: '#', onClick: () => logout() },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Apri sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard Admin
              </h1>
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="sr-only">Visualizza notifiche</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="ml-3 relative">
              <div>
                <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <span className="sr-only">Apri menu utente</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <a
                          href={item.href}
                          onClick={item.onClick}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          {item.name}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;