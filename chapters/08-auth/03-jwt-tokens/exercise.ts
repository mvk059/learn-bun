/**
 * Chapter 8.3 - JWT Tokens
 *
 * Token creation and verification with jose.
 */
import { SignJWT, jwtVerify } from "jose";

export interface TokenPayload {
  userId: string;
  role: string;
  [key: string]: any;
}

// TODO: Implement TokenService class
// Constructor: takes secret string, converts to Uint8Array with TextEncoder
// Methods:
// - createToken(payload: TokenPayload): Promise<string>
//   - Use SignJWT with HS256, setIssuedAt(), setExpirationTime("24h")
// - verifyToken(token: string): Promise<TokenPayload | null>
//   - Use jwtVerify, return payload on success, null on failure
// - decodeToken(token: string): TokenPayload | null
//   - Decode without verification (base64 decode middle part)
export class TokenService {
  constructor(private secret: string) {}

  async createToken(payload: TokenPayload): Promise<string> {
    throw new Error("Not implemented");
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    throw new Error("Not implemented");
  }

  decodeToken(token: string): TokenPayload | null {
    throw new Error("Not implemented");
  }
}
