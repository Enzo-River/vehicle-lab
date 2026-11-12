import { sedan, sports, suv } from './cars.js';
import { pickup, police } from './cars2.js';
import { minivan } from './cars3.js';
import { bus, firetruck, ambulance } from './special.js';
import { schoolbus, rv } from './special2.js';
import { semitruck, containertruck, cartransporter } from './trailers.js';
import { excavator, bulldozer, crane, mixer, tractor, loader, roller, dumper, combine, skidsteer, watertruck, forklift, garbagetruck, boomlift, boxtruck, concretepump, sweeper, tankertruck, sprayer } from './machines.js';
import { backhoe, seeder } from './machines2.js';
import { asphaltpaver, rotarydrill, truckcrane } from './machines3.js';
import { towtruck, doublebus, reeftruck } from './trucks3.js';

export const VEHICLES = [sedan, sports, suv, pickup, minivan, boxtruck, semitruck, containertruck, cartransporter, reeftruck, towtruck, doublebus, schoolbus, rv, bus, police, firetruck, ambulance, watertruck, garbagetruck, sweeper, tankertruck, excavator, backhoe, bulldozer, crane, concretepump, mixer, loader, skidsteer, forklift, boomlift, roller, dumper, tractor, seeder, combine, sprayer, asphaltpaver, rotarydrill, truckcrane];

export const CATEGORIES = ['家用车', '特种车', '工程车', '农用车'];

export const CATEGORY_META = {
  家用车: { icon: '🚘', color: '#2f6fd0' },
  特种车: { icon: '🚨', color: '#d63232' },
  工程车: { icon: '🏗️', color: '#f0b81d' },
  农用车: { icon: '🌾', color: '#3f8a4f' }
};
