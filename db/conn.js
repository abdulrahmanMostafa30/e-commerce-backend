import mongoose from 'mongoose';
const Db = process.env.ATLAS_URI;

const connectToServer = async () => {
  console.log(Db);
  try {
    await mongoose.connect(`${Db}`, {
      family: 4,
    });
    console.log("Connected!");
  } catch (error) {
    console.log(error);
  }
};

export { connectToServer };
