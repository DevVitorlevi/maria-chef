import cors from "@fastify/cors";
import fastify from "fastify";
import z, { ZodError } from "zod";
export const app = fastify();


app.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation Error",
      issues: z.treeifyError(error),
    });
  }

  return reply.status(500).send({
    message: "Internal Server Error",
  });
});
