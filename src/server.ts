import cors from "@fastify/cors";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { errorHandler } from "./error-handler";
import { createActivity } from "./routes/activities/create-activity";
import { getActivities } from "./routes/activities/get-activities";
import { createLink } from "./routes/links/create-link";
import { getLinks } from "./routes/links/get-links";
import { confirmParticipant } from "./routes/participants/confirm-participants";
import { createParticipant } from "./routes/participants/create-participant";
import { getParticipant } from "./routes/participants/get-participant";
import { getParticipants } from "./routes/participants/get-participants";
import { confirmTrip } from "./routes/trips/confirm-trip";
import { createTrip } from "./routes/trips/create-trip";
import { getTrip } from "./routes/trips/get-trips";
import { updateTrip } from "./routes/trips/update-trip";
import { env } from "./env";

const app = fastify()

app.register(cors, {
  origin: "*",
})

//Zod Validation Data
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

//Set Error Handler
app.setErrorHandler(errorHandler)

//Trips routes
app.register(createTrip)
app.register(confirmTrip)
app.register(updateTrip)
app.register(getTrip)

//Participants routes
app.register(confirmParticipant)
app.register(getParticipants)
app.register(createParticipant)
app.register(getParticipant)

//Activities routes
app.register(createActivity)
app.register(getActivities)

//Links routes
app.register(createLink)
app.register(getLinks)


app.listen({ port: env.PORT }).then(() => {
  console.log("Application Running")
})