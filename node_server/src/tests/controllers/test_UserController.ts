import request from "supertest";
import { UserService } from "../../services";
import express, { Application } from "express";
import errorHandler from "../../middleware/errorHandler";
import AppError from "../../utils/appError";

jest.mock("../services/userService");
jest.mock("../utils/logger");

const app: Application = express();
app.use(express.json());

app.use(errorHandler);

// Mocked data for users
const mockUsers = [
  {
    id: "994fc575-dc38-4718-9fc5-6a23c0ae0832",
    name: "John Doe",
    email: "john.doe@example.com",
    birth_date: "1995-11-15",
    active: true,
    createdAt: "2025-08-29T12:46:51.619Z",
    updatedAt: "2025-08-29T12:46:51.619Z",
  },
  {
    id: "af488024-dc38-4718-9fc5-6a23c0ae0832",
    name: "Test name",
    email: "test@example.com",
    birth_date: "2000-10-10",
    active: true,
    createdAt: "2025-08-29T12:46:51.619Z",
    updatedAt: "2025-08-29T12:46:51.619Z",
  },
];

// Test for the GET /users endpoint.
describe("GET /users", () => {
  it("should return all users with status 200", async () => {
    // Mock the behaviour of UserService.get_all
    (UserService.get_all as jest.Mock).mockResolvedValue(mockUsers);

    // Make the GET request and verify the response.
    const response = await request(app).get("/users");

    // Verify that the response has status code 200.
    expect(response.status).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("name");
    expect(response.body[0]).toHaveProperty("email");
    expect(response.body[0]).toHaveProperty("birth_date");
    expect(response.body[0]).toHaveProperty("active");
  });

  it("should handle errors correctly", async () => {
    // Mocked an error in the service.
    const errorMessage = "Error retrieving users";
    (UserService.get_all as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    // Make the GET request and verify the response.
    const response = await request(app).get("/users");

    // Verify that the status code is 500 for an internal server error.
    expect(response.status).toBe(500);

    // Verify that the body of the response contains the expected error.
    expect(response.body.message).toBe(errorMessage);
  });
});
