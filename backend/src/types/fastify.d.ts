import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}
