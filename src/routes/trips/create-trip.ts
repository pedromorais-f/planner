import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getMailClient } from "../../lib/mail";
import { prisma } from "../../lib/prisma";
import { ClientError } from "../../errors/client-error";
import { env } from "../../env";


export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips", {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email(),
        participants_to_invite: z.array(z.tuple([z.string(), z.string().email()]))
      })
    }
  }, async (request) => {
    const { destination, starts_at, ends_at, owner_name, owner_email, participants_to_invite  } = request.body

    if (dayjs(starts_at).isBefore(new Date())){
      throw new ClientError("Invalid Start Time")

    }else if (dayjs(ends_at).isBefore(starts_at)){
      throw new ClientError("Invalid End Time")
    }


    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
        participants: {
          createMany: {
            data: [
              {
                name: owner_name,
                email: owner_email,
                is_owner: true,
                is_confirmed: true,
              },
              ...participants_to_invite.map(([name, email]) => {
                return { name, email }
              })
            ],
          }
        }
      }
    })

    const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`

    const mail = await getMailClient()
    
    const message = await mail.sendMail({
      from: {
        name: "Planner",
        address: "planner@gmail.com"
      },
      to: {
        name: owner_name,
        address: owner_email
      },
      subject: `Confirm Trip to ${destination}`,
      html: `<a href=${confirmationLink}>Confirm Trip Creation</a>`
    })

    console.log(nodemailer.getTestMessageUrl(message))

    return { tripId: trip.id }
  })
}