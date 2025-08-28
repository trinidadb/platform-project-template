export class AuthService {
  /**
   * Login method
   *
   * Returns a simplified user object containing key user details such as id, email, name and lastname.
   *
   * The method follows these steps:
   * Extract relevant fields from the provided user object.
   * Return the simplified user object.
   *
   * @param user object: The user object containing detailed user information.
   *
   * @returns object: Simplified user details including id, email, name and lastname.
   */
  static async login(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
    };
  }
}
