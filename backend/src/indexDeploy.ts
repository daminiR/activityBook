//#TODO: Why does ES6 syntax provide perfomrance benefits?
import 'dotenv/config'
import  express from 'express';
import { ApolloServer, gql }  from 'apollo-server-lambda';
import  mongoose, {ConnectOptions} from 'mongoose';
import { mergeResolvers } from '@graphql-tools/merge';
import {resolvers as deleteUser} from './resolvers/deleteUser'
import {resolvers as createUser} from './resolvers/createUSer'
import {resolvers as likesDislikes} from './resolvers/likesDislikes'
import {resolvers as matches} from './resolvers/matches'
import {resolvers as random} from './resolvers/random'
import {resolvers as updateUser} from './resolvers/updateUser'
import {resolvers as uploads} from './resolvers/uploads'

import {graphqlUploadExpress} from 'graphql-upload'
import { typeDefs } from './typeDefs/typeDefs';
import { makeExecutableSchema } from '@graphql-tools/schema';


const startServer = async () => {
  const uri = process.env.ATLAS_URI as any
  const app = express()
  app.use(graphqlUploadExpress())
  const resolvers2 = mergeResolvers(
    [
      createUser,
      deleteUser,
      likesDislikes,
      matches,
      random,
      updateUser,
      uploads,
    ]
  );
  const schema = makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers2,
  });
  const server = new ApolloServer({
    schema: schema,
    context: async ({ event, context, express }) => {
      //context.callbackWaitsForEmptyEventLoop = false;
      //// Get the user token from the headers.
      //const authReq = express.req.headers.authorization || "";
      //const token = authReq.split("Bearer ")[1] || "";
      //// Try to retrieve a user with the token and verify
      //console.log("Token check", token)
      //var user = null as any;
      //if (token) {
        //console.log("so we have token", token)
        //verifier
          //.verify(token)
          //.then((payload) => {
            //console.log("do we get aws verification or no", payload);
            //user = payload;
            //return { user };
          //})
          //.catch((err) => {
            //console.log("we get no verification ", err);
            //user = null;
            //return { user };
          //});
      //} else {
        //user = null;
        //return { user };
      //}
      return "Context when needed"
    },
  });
  server.createHandler()
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .catch((error) => {
      console.log(error);
    });
  exports.graphqlHandler = server.createHandler({
    expressAppFromMiddleware(middleware) {
      const app = express();
      app.use(graphqlUploadExpress());
      app.use(middleware);
      return app;
    },
  });
  console.log(`🚀 Server ready at aws only ts`)
};
startServer();