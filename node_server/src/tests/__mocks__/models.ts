// Mock del modelo User
export const User = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  init: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
};

// Mock del modelo Prediction
export const Prediction = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  init: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
};

// Mock del modelo Dataset
export const Dataset = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  init: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
};

// Mock del modelo ModelML
export const ModelML = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  init: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
};

// Mock del enum PredictionStatus
export const PredictionStatus = {
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};

// Mock del conector de base de datos sin conexión real
export const postgresDbConnector = {
  sync: jest.fn().mockResolvedValue(true),
  authenticate: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
};
