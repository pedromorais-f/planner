import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";


export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantId/confirm", {
    schema: {
      params: z.object({
        participantId: z.string().uuid()
      })
    }
  }, 
  async (request) => {
    const { participantId } = request.params
    
    const participant = await prisma.participant.findUnique({
      where: {
        id: participantId
      }
    })
    
    if (!participant) {
      throw new Error("Participant not Found!")
    } else if (participant.is_confirmed){
      return "You are already confirmed in this trip!"
    }

    await prisma.participant.update({
      where: {
        id: participantId
      },
      data: {
        is_confirmed: true
      }
    })

    return "Presence Confirmed!"
  })
}