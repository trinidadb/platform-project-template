// src/services/api.js

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockUsers = [
  { 
    id: '994fc575-dc38-4718-9fc5-6a23c0ae0832', 
    name: 'John Doe', 
    email: 'john.doe@example.com', 
    active: true, 
    birth_date: '1995-11-15' 
  },
  { 
    id: 'af488024-dc38-4718-9fc5-6a23c0ae0832', 
    name: 'Test name', 
    email: 'test@example.com', 
    active: true, 
    birth_date: '2000-10-10' 
  },
];

export default {
  async getUsers() {
    await sleep(500);
    return { data: [...mockUsers] };
  },

  async deleteUser(userId) {
    await sleep(500);
    mockUsers = mockUsers.filter(user => user.id !== userId);
    return { status: 204 };
  },

  async createUser(userData) {
    await sleep(700);
    const newUser = { ...userData, id: crypto.randomUUID() };
    mockUsers.unshift(newUser);
    return { data: newUser };
  },

  async updateUser(userId, userData) {
    await sleep(700);
    const index = mockUsers.findIndex(user => user.id === userId);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return { data: mockUsers[index] };
    }
    return { status: 404, error: 'User not found' };
  }
};