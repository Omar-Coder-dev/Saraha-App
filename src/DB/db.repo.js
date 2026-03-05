export const create = async ({ model, data }) => await model.create(data);
export const findOne = async ({ model, query }) => await model.findOne(query);
export const findById = async ({ model, id }) => await model.findById(id);
export const findByIdAndUpdate = async ({
  model,
  id,
  data,
  options = { new: true },
}) => await model.findByIdAndUpdate(id, data, options);
