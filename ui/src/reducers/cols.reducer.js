const initialState = [];

/**
 * @param {object} state module state
 * @param {object} action to apply on state
 * @returns {object} new copy of state
 */
export function cols(state = initialState, action) {
  switch (action.type) {
    case "CHECK_UNCHECK_COLUMNS_CHECKBOX":
      return action.data;
    default:
      return state;
  }
}
