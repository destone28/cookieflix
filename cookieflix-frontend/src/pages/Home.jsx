import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ApiIntegrationBanner from '../components/ApiIntegrationBanner';

const Home = () => {
  // Simuliamo dati che in futuro verranno dall'API
  const [popularCategories, setPopularCategories] = useState([
    {
      id: 1,
      name: 'Serie TV e Film',
      slug: 'serie-tv-film',
      description: 'Design ispirati ai tuoi film e serie TV preferiti',
      image: 'https://placehold.co/300x200?text=Serie+TV'
    },
    {
      id: 2,
      name: 'Videogiochi',
      slug: 'videogiochi',
      description: 'Personaggi e simboli dai videogiochi più amati',
      image: 'https://placehold.co/300x200?text=Videogiochi'
    },
    {
      id: 3,
      name: 'Feste Stagionali',
      slug: 'feste-stagionali',
      description: 'Design per ogni festività e stagione',
      image: 'https://placehold.co/300x200?text=Feste'
    },
    {
      id: 4,
      name: 'Animali e Creature',
      slug: 'animali-creature',
      description: 'Animali reali e creature fantastiche',
      image: 'https://placehold.co/300x200?text=Animali'
    }
  ]);

  const [subscriptionPlans, setSubscriptionPlans] = useState([
    {
      id: 1,
      name: 'Starter',
      description: 'Piano base per iniziare',
      monthly_price: 15.90,
      features: [
        '4 cookie cutters al mese',
        '1 categoria a scelta',
        'Accesso alla community'
      ],
      is_popular: false
    },
    {
      id: 2,
      name: 'Creator',
      description: 'Il piano più popolare',
      monthly_price: 23.90,
      features: [
        '7 cookie cutters al mese',
        '2 categorie a scelta',
        'Accesso alla community',
        'Anteprima nuovi design'
      ],
      is_popular: true
    },
    {
      id: 3,
      name: 'Master',
      description: 'Per veri appassionati',
      monthly_price: 29.90,
      features: [
        '10 cookie cutters al mese',
        '3 categorie a scelta',
        'Accesso alla community',
        'Anteprima nuovi design',
        'Accesso esclusivo a design speciali'
      ],
      is_popular: false
    }
  ]);

  const testimonials = [
    {
      id: 1,
      name: 'Marco B.',
      role: 'Pasticcere Amatoriale',
      content: 'Cookieflix ha trasformato la mia passione per i biscotti. Ogni mese ricevo design unici che stupiscono amici e famiglia!',
      avatar: 'https://placehold.co/100?text=MB'
    },
    {
      id: 2,
      name: 'Giulia T.',
      role: 'Food Blogger',
      content: 'La qualità dei cookie cutters è eccellente e i design sono sempre originali. Il mio abbonamento Creator è il miglior investimento per il mio blog.',
      avatar: 'https://placehold.co/100?text=GT'
    },
    {
      id: 3,
      name: 'Alessandro P.',
      role: 'Chef Professionista',
      content: 'Uso Cookieflix per creare dessert unici nel mio ristorante. Il piano Master mi dà accesso a design esclusivi che nessun altro ha.',
      avatar: 'https://placehold.co/100?text=AP'
    }
  ];

  const faqs = [
    {
      question: 'Come funziona l\'abbonamento?',
      answer: 'Scegli un piano, selezioni le tue categorie preferite e ogni mese ricevi un set di cookie cutters stampati in 3D basati sui design più votati dalla community.'
    },
    {
      question: 'Posso cambiare piano o categorie?',
      answer: 'Sì, puoi modificare il tuo piano o le categorie in qualsiasi momento. I cambiamenti avranno effetto dal ciclo di fatturazione successivo.'
    },
    {
      question: 'I cookie cutters sono lavabili in lavastoviglie?',
      answer: 'I nostri cookie cutters sono realizzati in PLA alimentare e sono lavabili a mano con acqua tiepida e sapone neutro. Non raccomandiamo l\'uso della lavastoviglie in quanto le alte temperature potrebbero deformarli.'
    },
    {
      question: 'Posso annullare l\'abbonamento?',
      answer: 'Puoi annullare il tuo abbonamento in qualsiasi momento dal tuo profilo. L\'abbonamento rimarrà attivo fino alla fine del periodo pagato.'
    }
  ];

  return (
    <div>

      {/* Banner di test API - solo in ambiente di sviluppo */}
      {import.meta.env.DEV && <ApiIntegrationBanner />}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Cookie Cutters Unici Ogni Mese
              </h1>
              <p className="text-lg mb-8">
                Abbonati a Cookieflix e ricevi ogni mese cookie cutters 3D unici, scelti dalla community e spediti direttamente a casa tua.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/subscription" className="bg-white text-primary px-6 py-3 rounded-lg font-bold text-center hover:bg-opacity-90 transition">
                  Scopri i Piani
                </Link>
                <Link to="/catalog" className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-bold text-center hover:bg-white hover:bg-opacity-10 transition">
                  Esplora il Catalogo
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://placehold.co/600x400?text=Cookieflix+Hero" 
                alt="Cookieflix cookie cutters" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Categorie Popolari</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Esplora le nostre categorie più amate e scopri migliaia di design unici creati dai nostri artisti e votati dalla community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map(category => (
              <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <Link to={`/catalog?category=${category.slug}`} className="text-primary font-bold hover:underline">
                    Esplora &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/catalog" className="bg-secondary text-white px-6 py-3 rounded-lg font-bold inline-block hover:bg-opacity-90 transition">
              Vedi Tutte le Categorie
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Piani di Abbonamento</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Scegli il piano perfetto per te e inizia a ricevere cookie cutters unici ogni mese.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map(plan => (
              <div 
                key={plan.id} 
                className={`bg-light-bg rounded-lg overflow-hidden shadow-lg transition transform hover:-translate-y-1 ${plan.is_popular ? 'ring-2 ring-tertiary relative' : ''}`}
              >
                {plan.is_popular && (
                  <div className="bg-tertiary text-dark-text text-xs font-bold uppercase px-3 py-1 absolute top-0 right-0 transform translate-x-2 -translate-y-1/2 rounded">
                    Più Popolare
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.monthly_price.toFixed(2)}€</span>
                    <span className="text-gray-600">/mese</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-primary flex-shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/subscription"
                    className={`block w-full text-center py-3 px-4 rounded-lg font-bold transition ${
                      plan.is_popular 
                        ? 'bg-primary text-white hover:bg-opacity-90' 
                        : 'bg-white border border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    Scegli Piano
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cosa Dicono i Nostri Abbonati</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Scopri le esperienze di chi ha già scelto Cookieflix per la propria creatività in cucina.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full mr-4" 
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Domande Frequenti</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Trova risposte alle domande più comuni sul servizio Cookieflix.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="py-6">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Hai altre domande?</p>
            <a href="mailto:info@cookieflix.com" className="text-primary font-bold hover:underline">
              Contattaci
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto a Iniziare la Tua Avventura Creativa?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Unisciti a migliaia di appassionati di biscotti e ricevi ogni mese cookie cutters unici direttamente a casa tua.
          </p>
          <Link to="/register" className="bg-white text-primary px-8 py-4 rounded-lg font-bold inline-block hover:bg-opacity-90 transition">
            Registrati Ora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;