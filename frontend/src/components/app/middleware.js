export const loadingMiddleware = (allActions) => (store) => (next) => (action) => {
  const { dispatch } = store;
  const result = next(action);

  // console.log("[loadingMiddleware]", action);

  if (action.type.includes("pending")) {
    dispatch(allActions.setLoading(true));
  }
  if (action.type.includes("fulfilled")) {
    dispatch(allActions.setLoading(false));
  }
  if (action.type.includes("rejected")) {
    dispatch(allActions.setLoading(false));
  }

  return result;
};
