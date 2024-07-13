import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getMailClient } from "../../lib/mail";
import { prisma } from "../../lib/prisma";


export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", {
    schema: {
      params: z.object({
        tripId: z.string().uuid()
      })
    }
  }, 
  async (request) => {
    const { tripId } = request.params
    
    const trip = await prisma.trip.findUnique({
      where: { 
        id: tripId 
      },
      include: {
        participants: {
          where: { 
            is_owner: false 
          }
        }
      }
    })

    if (!trip){
      throw new Error("Trip was not found!")
    } else if (trip.is_confirmed){
      return "Trip already Confirmed!"
    }

    await prisma.trip.update({
      where: { 
        id: tripId 
      },
      data: { 
        is_confirmed: true 
      }
    })

    
    const mail = await getMailClient()
    
    await Promise.all(
      trip.participants.map(async (participant) => {
        
        const confirmationLink = `http://localhost:8080/participants/${participant.id}/confirm`
        
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

      })
    )
  

    return "Trip Created with Success!"
  })
}