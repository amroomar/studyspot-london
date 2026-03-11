/**
 * CitySelector — Landing page for choosing London or Bristol
 */
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, BookOpen, Coffee, Wifi } from 'lucide-react';
import { useCity, type CityId } from '@/contexts/CityContext';
import { useLocation } from 'wouter';
import { BRISTOL_HERO_IMAGES } from '@/lib/bristolImages';

const cities = [
  {
    id: 'london' as CityId,
    name: 'London',
    subtitle: '310+ Study Spots',
    description: 'From Shoreditch cafes to Bloomsbury libraries — discover the best places to study across the capital.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
    color: 'from-emerald-900/80 to-amber-900/60',
    accent: 'bg-emerald-500',
    stats: { cafes: 120, libraries: 45, coworking: 35, hidden: 110 },
  },
  {
    id: 'bristol' as CityId,
    name: 'Bristol',
    subtitle: '100+ Study Spots',
    description: 'From harbourside coworking to Clifton cafes — explore Bristol\'s vibrant study scene.',
    image: BRISTOL_HERO_IMAGES.main,
    color: 'from-cyan-900/80 to-blue-900/60',
    accent: 'bg-cyan-500',
    stats: { cafes: 40, libraries: 15, coworking: 15, hidden: 30 },
  },
];

export default function CitySelector() {
  const { setCity } = useCity();
  const [, navigate] = useLocation();

  const handleSelect = (cityId: CityId) => {
    setCity(cityId);
    navigate(cityId === 'london' ? '/london' : '/bristol');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              StudySpot
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Find your perfect study spot</p>
          </div>
        </motion.div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10 max-w-xl"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Choose your city
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Curated study spots, real reviews, and community discoveries in the UK's best student cities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {cities.map((city, i) => (
            <motion.button
              key={city.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              onClick={() => handleSelect(city.id)}
              className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {/* Background image */}
              <div className="relative h-80 sm:h-96">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${city.color}`} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  {/* City badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${city.accent}`} />
                    <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
                      {city.subtitle}
                    </span>
                  </div>

                  {/* City name */}
                  <h3 className="text-4xl sm:text-5xl text-white font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {city.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/80 text-sm sm:text-base mb-5 max-w-sm leading-relaxed">
                    {city.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>{city.stats.cafes} Cafes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{city.stats.libraries} Libraries</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>{city.stats.coworking} Coworking</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
                    <MapPin className="w-4 h-4" />
                    <span>Explore {city.name}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-xs mt-8 text-center"
        >
          More cities coming soon — Manchester, Edinburgh, Oxford...
        </motion.p>
      </main>
    </div>
  );
}
