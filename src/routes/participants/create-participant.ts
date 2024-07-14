import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getMailClient } from "../../lib/mail";
import { prisma } from "../../lib/prisma";
import { ClientError } from "../../errors/client-error";
import { env } from "../../env";


export async function createParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/participant", {
    schema: {
      params: z.object({
        tripId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        email: z.string().email()
      })
    }
  }, async (request) => {
    const { tripId } = request.params
    const { name, email } = request.body

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      }
    })

    if (!trip) {
      throw new ClientError("Trip was not found")

    }

    const participant = await prisma.participant.create({
      data: {
        name,
        email,
        trip_id: tripId
      }
    })

    const mail = await getMailClient()


    const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

    const message = await mail.sendMail({
      from: {
        name: "Planner",
        address: "planner@gmail.com"
      },
      to: {
        name: participant.name,
        address: participant.email
      },
      subject: `Confirm Trip to ${trip.destination}`,
      html: `<a href=${confirmationLink}>Confirm Trip Participation</a>`
    })

    console.log(nodemailer.getTestMessageUrl(message))


    return { participantId: participant.id }
  })
}