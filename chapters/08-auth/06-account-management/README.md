# 8.6 Account Management

## What You'll Learn

- How to implement profile update endpoints (email and password changes)
- Why password changes must require the current password for verification
- How to implement account deletion with proper cleanup
- Patterns for protecting sensitive operations with authentication

## Prerequisites

- Completed Lesson 8.4 (Registration and Login) and Lesson 8.5 (JWT Middleware)
- Understanding of JWT-based authentication flow
- Familiarity with Bun's `password.hash()` and `password.verify()` utilities

## Why Account Management Matters

Every application that has user accounts needs to let users manage those accounts.
At minimum, users expect to:

1. **Update their email address** -- people change email providers, get married, or
   just want to use a different address.
2. **Change their password** -- security best practices encourage periodic password
   rotation, and users who suspect a compromise need to act fast.
3. **Delete their account** -- privacy regulations like GDPR give users the "right to
   be forgotten." Even without legal requirements, it is good practice.

Each of these operations carries security implications. Changing an email without
verification could let an attacker lock the real user out. Changing a password
without confirming the old one means a stolen session token grants permanent
access. Deleting an account must cascade cleanly so orphaned data does not linger.

## Profile Updates

The `PUT /api/auth/profile` endpoint handles both email updates and password
changes in a single route. The request body can contain:

```json
{
  "email": "new@example.com",
  "currentPassword": "OldPass1",
  "newPassword": "NewPass2"
}
```

All fields are optional, but password changes enforce an important rule: you must
provide `currentPassword` alongside `newPassword`. This prevents an attacker who
steals a JWT from silently changing the password.

### Email Update Flow

1. Verify the JWT to identify the user.
2. Check that the new email is not already taken by another user.
3. Update the `email` column in the database.
4. Return the updated user profile (without the password hash).

### Password Change Flow

1. Verify the JWT to identify the user.
2. Confirm `currentPassword` matches the stored hash using `Bun.password.verify()`.
3. If it does not match, return `400 Bad Request`.
4. Hash the new password with `Bun.password.hash()` using argon2id.
5. Update the `password_hash` column in the database.

```typescript
// Verifying the current password before allowing a change
const isValid = await Bun.password.verify(
  body.currentPassword,
  user.password_hash
);
if (!isValid) {
  return Response.json(
    { error: "Current password is incorrect" },
    { status: 400 }
  );
}

const newHash = await Bun.password.hash(body.newPassword, {
  algorithm: "argon2id",
});
await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${userId}`;
```

## Account Deletion

The `DELETE /api/auth/account` endpoint removes the authenticated user's record
from the database entirely. In a production system you would also need to:

- Delete or anonymize any content the user created (cascade cleanup)
- Revoke all active sessions or tokens
- Send a confirmation email
- Potentially implement a soft-delete with a grace period

For this lesson we perform a hard delete and return `204 No Content`:

```typescript
if (req.method === "DELETE" && pathname === "/api/auth/account") {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return Response.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  await sql`DELETE FROM users WHERE id = ${authUser.userId}`;
  return new Response(null, { status: 204 });
}
```

After deletion, any subsequent login attempt with the old credentials will fail
because the user row no longer exists.

## Security Considerations

| Operation        | Requires Auth | Extra Verification     |
|------------------|---------------|------------------------|
| Update email     | Yes (JWT)     | No (but production should verify new email) |
| Change password  | Yes (JWT)     | Must provide current password |
| Delete account   | Yes (JWT)     | No (but production may require password confirmation) |

In a real application you would likely add:

- **Email verification** -- send a confirmation link to the new address before
  committing the change.
- **Rate limiting** -- prevent brute-force attempts on the current password field.
- **Audit logging** -- record when sensitive changes happen for security review.
- **Password confirmation for deletion** -- require the user to type their password
  before deleting the account, not just present a valid JWT.

## Running the Exercise

```bash
cd chapters/08-auth/06-account-management

# Run tests against your exercise
bun test exercise.test.ts

# Run tests against the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

## Key Takeaways

1. **Always require the current password for password changes.** A stolen JWT should
   not grant the ability to permanently take over an account.
2. **Account deletion must be thorough.** Delete or cascade all related data to avoid
   orphaned records and privacy violations.
3. **Return minimal data.** Never include the password hash in API responses --
   return only safe fields like id, username, email, and role.
4. **Use proper HTTP status codes.** `200` for successful updates, `204` for
   successful deletions, `400` for invalid input, `401` for missing auth, and
   `409` for conflicts like duplicate emails.
