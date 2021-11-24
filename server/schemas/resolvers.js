const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const thing = await User.findOne({ _id: context?.user?._id }).select(
          "-__v -password"
        );

        // .populate("savedBooks");
        return thing;
      }
      throw new AuthenticationError("Check you are logged in");
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
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
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        // const book = await Book.create({
        //   ...args,
        // });
        // const saveBookCount = book.savedBooks.length();
        const book = await User.findOneAndUpdate(
          { _id: context.user._id },
          // solution uses push
          { $addToSet: { savedBooks: bookData } },
          // according to solution
          { new: true }
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
          { $pull: { savedBooks: { bookId: bookId } } },
          // according to solution
          { new: true }
        );

        return book;
      }
      throw new AuthenticationError("You are not logged in!");
    },
  },
};

module.exports = resolvers;
