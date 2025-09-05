import { DataTypes, Model } from "sequelize";
import { postgresDbConnector } from "../connectors";


class Profile extends Model {}

Profile.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  keycloakId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, 
{
  sequelize: postgresDbConnector,
  tableName: 'profiles',
});

export default Profile;
