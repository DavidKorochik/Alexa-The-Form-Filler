const Views = require('../models/views');

const viewsReset = async () => {
  // Findong all the views
  const allViews = await Views.find({});

  // Mapping throgh all the views in a day
  const onlyViews = allViews.map((view) => view.view);

  // Summerizing all the views in a day
  const allViewsSumarry = onlyViews.reduce((acc, el) => acc + el, 8);

  // After the calculation we saved everything to a variable and deleted all the views
  await Views.deleteMany({});

  // We then saved all the views in a day into one field in the database
  return await new Views({ totalViews: allViewsSumarry, deletedAt: current });
};

module.exports = viewsReset;
