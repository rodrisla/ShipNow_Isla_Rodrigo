import { UserModel } from '../models/user.model.js';

class UserRepository {
  async getAll() {
    return UserModel.find();
  }

  async getById(id) {
    return UserModel.findById(id);
  }

  async getByEmail(email) {
    return UserModel.findOne({ email });
  }

  async create(userData) {
    return UserModel.create(userData);
  }

  async addDocument(id, document) {
    return UserModel.findByIdAndUpdate(
      id,
      { $push: { documents: document } },
      { returnDocument: 'after', runValidators: true }
    );
  }

  async updateById(id, userData) {
    return UserModel.findByIdAndUpdate(id, userData, {
      returnDocument: 'after',
      runValidators: true
    });
  }

  async deleteById(id) {
    return UserModel.findByIdAndDelete(id);
  }
}

export const userRepository = new UserRepository();