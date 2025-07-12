import { base44 } from './base44Client';
import * as local from './localEntities.js';

const useLocal = import.meta.env?.VITE_USE_LOCAL_API;

export const Pass = useLocal ? local.Pass : base44.entities.Pass;
export const Booking = useLocal ? local.Booking : base44.entities.Booking;
export const Payment = useLocal ? local.Payment : base44.entities.Payment;
export const Space = useLocal ? local.Space : base44.entities.Space;
export const User = useLocal ? local.User : base44.auth;
