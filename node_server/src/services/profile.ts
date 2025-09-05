import { Profile } from '../models';

export class ProfileService {

  static async createProfile(profileData: {
    keycloakId: string;
  }): Promise<Profile> {
    try {
        const newProfile = await Profile.create(profileData);
        return newProfile;
    } catch (err) {
        throw err;
    }
  }
}