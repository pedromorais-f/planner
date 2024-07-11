import fastify from "fastify";


const app = fastify()

app.get("/test", () => {
  return "Hello World"
})

app.listen({ port: 8080 }).then(() => {
  console.log("Application Running")
})