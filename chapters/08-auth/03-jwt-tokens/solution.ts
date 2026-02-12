/**
 * Chapter 8.3 - JWT Tokens (Solution)
 */
import { SignJWT, jwtVerify } from "jose";

export interface TokenPayload {
  userId: string;
  role: string;
  [key: string]: any;
}

export class TokenService {
  private secretKey: Uint8Array;

  constructor(private secret: string) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async createToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(this.secretKey);
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      return payload as unknown as TokenPayload;
    } catch {
      return null;
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }
}
