const initialState = {};

/**
 * @param {object} state module state
 * @param {object} action to apply on state
 * @returns {object} new copy of state
 */
export function flit(state = initialState, action) {
  switch (action.type) {
    case "ADD_IN_OBJECT":
      // setFlits((prevState) => ({
      //   ...prevState,
      //   [column]: filterList[index][0],
      // }));
      console.log("IN FLIT REDUCER", action.data);
      console.log({ ...state, ...action.data });
      return { ...state, ...action.data };
    case "REMOVE_IN_OBJECT":
      console.log("REMOVE_IN_OBJECT", action.data);
      delete state[action.data.column];
      console.log("After remove state", state);
      return { ...state };
    default:
      return state;
  }
}
