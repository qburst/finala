const initialState = [];

/**
 * @param {object} state module state
 * @param {object} action to apply on state
 * @returns {object} new copy of state
 */
export function cols(state = initialState, action) {
  switch (action.type) {
    case "CHECK_UNCHECK_COLUMNS_CHECKBOX":
      console.log("IN check REDUCER", action.data);
      console.log([...state, ...action.data]);
      return action.data;
    default:
      return state;
  }
}
