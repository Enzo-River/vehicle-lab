import { sedan, sports, suv } from './cars.js';
import { pickup, police } from './cars2.js';
import { bus, firetruck, ambulance } from './special.js';
import { excavator, bulldozer, crane, mixer, tractor, loader, roller, dumper, combine, skidsteer, watertruck, forklift, garbagetruck, boomlift, boxtruck, concretepump, sweeper, tankertruck, sprayer } from './machines.js';

export const VEHICLES = [sedan, sports, suv, pickup, boxtruck, bus, police, firetruck, ambulance, watertruck, garbagetruck, sweeper, tankertruck, excavator, bulldozer, crane, concretepump, mixer, loader, skidsteer, forklift, boomlift, roller, dumper, tractor, combine, sprayer];

export const CATEGORIES = ['家用车', '特种车', '工程车', '农用车'];

export const CATEGORY_META = {
  家用车: { icon: '🚘', color: '#2f6fd0' },
  特种车: { icon: '🚨', color: '#d63232' },
  工程车: { icon: '🏗️', color: '#f0b81d' },
  农用车: { icon: '🌾', color: '#3f8a4f' }
};
