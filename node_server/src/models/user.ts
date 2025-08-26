import { DataTypes, Model } from "sequelize";
import { postgresDbConnector } from "../connectors";


class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    }
  },
  {
    sequelize: postgresDbConnector,
    tableName: "users",
    timestamps: true,
  }
);

export default User;
