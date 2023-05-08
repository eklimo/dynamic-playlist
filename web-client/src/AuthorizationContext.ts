import { createContext } from 'react';
import { AuthorizationState } from './authorization';

export const AuthorizationContext = createContext(null as (AuthorizationState | null));
