const Views = require('../models/views');

const viewsReset = async () => {
  const allViews = await Views.find({});
  const onlyViews = allViews.map((view) => view.view);
  const allViewsSumarry = onlyViews.reduce((acc, el) => acc + el, 8);
  await Views.deleteMany({});
  return await new Views({ totalViews: allViewsSumarry, deletedAt: current });
};

module.exports = viewsReset;
