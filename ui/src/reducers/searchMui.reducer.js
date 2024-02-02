const initialState = "";

/**
 * @param {object} state module state
 * @param {object} action to apply on state
 * @returns {object} new copy of state
 */
export function searchMui(state = initialState, action) {
  switch (action.type) {
    case "ON_TEXT_ENTERED":
      return (state = action.data);
    default:
      return state;
  }
}
