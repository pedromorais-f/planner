import fastify from "fastify";
import cors from "@fastify/cors"
import { createTrip } from "./routes/create-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm-trip";

const app = fastify()

app.register(cors, {
  origin: "*",
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip)
app.register(confirmTrip)


app.listen({ port: 8080 }).then(() => {
  console.log("Application Running")
})