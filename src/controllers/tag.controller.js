import Tag from "../models/tag.model.js";

export const createNewTag = async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const tag = await Tag.create({ name, slug });
  res.status(201).json(tag);
};
export const getAllNameTags = async (req, res) => {
  const tags = await Tag.aggregate([
    { $sort: { name: 1 } },
    {
      $lookup: {
        from: "posts",
        let: { tagId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$tagId", "$tags"] },
                  { $eq: ["$isPublished", true] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "postCountResult",
      },
    },
    {
      $addFields: {
        postCount: {
          $ifNull: [{ $arrayElemAt: ["$postCountResult.count", 0] }, 0],
        },
      },
    },
    { $project: { postCountResult: 0 } },
  ]);
  res.status(200).json({ tags, totalTags: tags.length });
};
export const deleteTag = async (req, res) => {
  await Tag.findByIdAndDelete(req.params.id);
  return res.status(200).json("Delete tag succesfully");
};
