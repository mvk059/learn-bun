/**
 * Chapter 6.3 - Validation Errors (Solution)
 */

class BadRequestError extends Error {
  statusCode = 400;
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "BadRequestError";
    this.details = details;
  }
}

export function validateOrThrow<T>(
  input: T,
  validator: (input: T) => string[]
): T {
  const errors = validator(input);
  if (errors.length > 0) {
    throw new BadRequestError("Validation failed", { errors });
  }
  return input;
}

export function withValidation<T>(
  validator: (input: any) => string[],
  handler: (req: Request, data: T) => Response | Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { errors: ["Invalid or missing JSON body"] },
        { status: 400 }
      );
    }

    const errors = validator(body);
    if (errors.length > 0) {
      return Response.json({ errors }, { status: 400 });
    }

    return handler(req, body as T);
  };
}
