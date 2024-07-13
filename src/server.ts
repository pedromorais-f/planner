import cors from "@fastify/cors";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createActivity } from "./routes/activities/create-activity";
import { getActivities } from "./routes/activities/get-activities";
import { createLink } from "./routes/links/create-link";
import { getLinks } from "./routes/links/get-links";
import { confirmParticipant } from "./routes/participants/confirm-participants";
import { confirmTrip } from "./routes/trips/confirm-trip";
import { createTrip } from "./routes/trips/create-trip";

const app = fastify()

app.register(cors, {
  origin: "*",
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

//Trips routes
app.register(createTrip)
app.register(confirmTrip)

//Participants routes
app.register(confirmParticipant)

//Activities routes
app.register(createActivity)
app.register(getActivities)

//Links routes
app.register(createLink)
app.register(getLinks)


app.listen({ port: 8080 }).then(() => {
  console.log("Application Running")
})