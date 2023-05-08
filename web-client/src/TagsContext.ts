import { createContext } from 'react';
import { Tag } from './model';

export const TagsContext = createContext([] as Tag[]);
