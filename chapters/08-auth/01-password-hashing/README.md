# 8.1 Password Hashing

## What You'll Learn

- Why storing plain-text passwords is dangerous
- What Argon2id is and why it is the recommended hashing algorithm
- How to hash passwords with `Bun.password.hash`
- How to verify passwords with `Bun.password.verify`
- How to validate password strength before hashing

## Why Hash Passwords?

If your database is ever compromised -- through a SQL injection, a stolen
backup, or an insider threat -- every plain-text password inside it is
instantly exposed. Attackers can log in as any user, and because people reuse
passwords, the damage often spreads far beyond your application.

Hashing converts a password into a fixed-length string that cannot be reversed
back to the original. Even if attackers steal the hashes, they cannot recover
the passwords without brute-forcing each one individually. A good hash
algorithm makes that brute force prohibitively expensive.

| Storage method | Time to crack one password | Risk level |
|---|---|---|
| Plain text | Instant | Critical |
| MD5 / SHA-256 | Seconds (GPU) | High |
| bcrypt | Hours to days | Medium |
| **Argon2id** | **Days to years** | **Low** |

## What Is Argon2id?

Argon2 is the winner of the 2015 Password Hashing Competition. It comes in
three variants:

- **Argon2d** -- optimized against GPU attacks but vulnerable to side-channel
  attacks
- **Argon2i** -- resistant to side-channel attacks but less GPU-resistant
- **Argon2id** -- a hybrid that combines the strengths of both

Argon2id is **memory-hard**, meaning it deliberately consumes a large amount
of RAM during hashing. This makes it extremely expensive to run on specialized
hardware (GPUs, ASICs) that attackers use for mass cracking. It is the
algorithm recommended by OWASP for password storage.

### Automatic Salt Generation

Every time you hash a password, Argon2id generates a random **salt** -- a
unique value mixed into the hash. This means the same password produces a
different hash each time, which defeats precomputed rainbow-table attacks:

```ts
const hash1 = await Bun.password.hash("hello", { algorithm: "argon2id" });
const hash2 = await Bun.password.hash("hello", { algorithm: "argon2id" });
// hash1 !== hash2, but both verify against "hello"
```

The salt is stored inside the hash string itself (the `$argon2id$...` format),
so you never need to manage it separately.

## Key APIs

### Hashing a Password

`Bun.password.hash` is an async function that returns the hashed string:

```ts
const hash = await Bun.password.hash("mypassword", {
  algorithm: "argon2id",
});
// "$argon2id$v=19$m=65536,t=2,p=1$..."
```

The default cost parameters (memory, iterations, parallelism) are tuned for a
good balance of security and speed. You can override them, but the defaults
are appropriate for most applications.

### Verifying a Password

`Bun.password.verify` compares a plain-text password against a previously
stored hash. It reads the algorithm and parameters from the hash string
automatically:

```ts
const isValid = await Bun.password.verify("mypassword", hash);
// true

const isWrong = await Bun.password.verify("wrongpassword", hash);
// false
```

This function is intentionally slow (it re-runs the full Argon2id computation)
to make brute-force attacks impractical.

### Password Strength Validation

Before hashing, you should validate that the password meets minimum strength
requirements. A common set of rules:

- At least **8 characters** long
- Contains at least one **uppercase** letter
- Contains at least one **lowercase** letter
- Contains at least one **number**

Collect all violations into an array so the user can fix everything in one
attempt:

```ts
function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Must contain uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Must contain lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Must contain a number");
  return errors;
}
```

Returning an empty array signals that the password is valid.

## Security Best Practices

1. **Never log passwords.** Not in access logs, not in error logs, not in
   debug output.
2. **Never store plain-text passwords.** Always hash before writing to the
   database.
3. **Use Argon2id.** It is the current industry recommendation. Avoid MD5,
   SHA-256, and even bcrypt for new applications.
4. **Validate strength server-side.** Client-side validation is a convenience;
   the server is the authority.
5. **Rate-limit login attempts.** Even the strongest hash cannot protect a
   weak password from unlimited guesses.

## Exercise

Open **exercise.ts** and implement three functions:

- `hashPassword` -- hash a password string with Argon2id
- `verifyPassword` -- verify a plain password against a hash
- `validatePasswordStrength` -- return an array of error strings

Run the tests:

```bash
bun test exercise.test.ts
```

Check your work against the reference solution:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

## What's Next

In the next lesson you will use these password utilities to build a user
registration endpoint that stores hashed credentials in the database.
