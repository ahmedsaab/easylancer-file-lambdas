import Indexer from "../services/mongodb.index-service";

export default async (event) => {
  const updates = event.Records.map((record) => {
    const filePath = record.s3.object.key;
    const fileSize = record.s3.object.size;
    const indexId = filePath.split('/')[1];

    return Indexer.updateById(indexId,{
      fileSize,
      uploaded: true
    });
  });

  await Promise.all(updates);

  // eslint-disable-next-line no-console
  console.log(`Updated ${updates.length} files`);
};
