/**
 * Chapter 6.2 - Global Error Handler (Solution)
 */

export class HttpError extends Error {
  statusCode: number;
  details?: any;
  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

type Handler = (req: Request) => Response | Promise<Response>;

export function withErrorHandling(handler: Handler): Handler {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof HttpError) {
        const body: Record<string, any> = { error: error.message };
        if (error.details !== undefined) {
          body.details = error.details;
        }
        return Response.json(body, { status: error.statusCode });
      }

      console.error("Unhandled error:", error);
      return Response.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
