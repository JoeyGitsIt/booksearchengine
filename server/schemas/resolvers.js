const { User, Book } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context?.user?._id }).populate(
          "savedBooks"
        );
      }
      throw new AuthenticationError("Check you are logged in");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Check your email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    // what all is getting passed into args?
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        // const book = await Book.create({
        //   ...args,
        // });
        // const saveBookCount = book.savedBooks.length();
        const book = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args } }
        );

        return book;
      }
      throw new AuthenticationError("You are not logged in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        // = await Book.findOneAndDelete({
        //   bookId: args.bookId,
        // });
        const book = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args } } }
        );

        return book;
      }
      throw new AuthenticationError("You are not logged in!");
    },
  },
};

module.exports = resolvers;
