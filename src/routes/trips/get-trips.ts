import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { ClientError } from "../../errors/client-error";


export async function getTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/details", {
    schema: {
      params: z.object({
        tripId: z.string().uuid()
      })
    }
  }, async (request) => {
    const { tripId } = request.params

    const trip = await prisma.trip.findUnique({
      select: {
        destination: true,
        starts_at: true,
        ends_at: true,
        is_confirmed: true,
        participants: {
          select:{
            name: true,
            email: true,
            is_confirmed: true
          }
        }
      },
      where: {
        id: tripId
      }
    })

    if (!trip) {
      throw new ClientError("Trip was not found")

    }


    return { trip: trip }
  })
}