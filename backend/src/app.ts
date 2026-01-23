import cors from "@fastify/cors";
import fastify from "fastify";
import z, { ZodError } from "zod";
import { dishRoutes } from "./http/routes/dish.routes";
import { ingredientroutes } from "./http/routes/ingredient.routes";
import { mealRoutes } from "./http/routes/meal.routes";
import { menuRoutes } from "./http/routes/menu.routes";
export const app = fastify();

app.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

app.register(dishRoutes)
app.register(ingredientroutes)
app.register(menuRoutes)
app.register(mealRoutes)

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
