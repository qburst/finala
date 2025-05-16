const initialState = {};

/**
 * @param {object} state module state
 * @param {object} action to apply on state
 * @returns {object} new copy of state
 */
export function flit(state = initialState, action) {
  switch (action.type) {
    case "ADD_IN_OBJECT":
      return { ...state, ...action.data };
    case "REMOVE_IN_OBJECT":
      delete state[action.data.column];
      return { ...state };
    default:
      return state;
  }
}
