import { featureKey, State } from './state';
import { escalationReducer } from './reducers';

export const reducer = escalationReducer;
export { State, featureKey };
