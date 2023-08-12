import path from "path";
import "dotenv/config";

import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import xXssProtection from "x-xss-protection";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import favicon from "serve-favicon";
import useragent from "express-useragent";
import swaggerJsDoc from "swagger-jsdoc";

import compression from "compression";
import hpp from "hpp";
import schemas from "./schemas"; // Assuming schemas.mjs is an ECMAScript module
import swaggerUi from "swagger-ui-express";
import AppError from "./utils/appError";
import * as dbo from "./db/conn";
import apiRoutes from "./routes"; // Assuming apiRoutes.js is in the root directory
import globalErrorHandler from "./controllers/error";
import AdminJS from "adminjs";
import * as AdminJSMongooseAdapter from "@adminjs/mongoose";

import AdminJSExpress from "@adminjs/express";
import User from "./models/user";

AdminJS.registerAdapter(AdminJSMongooseAdapter);

const adminJsOptions = {
  resources: [
    {
      resource: schemas.Product,
    },
    {
      resource: schemas.Category,
    },
    {
      resource: schemas.User,
    },
    {
      resource: schemas.Cart,
    },
    {
      resource: schemas.Order,
    },
    {
      resource: schemas.Payment,
    },
    {
      resource: schemas.Wishlist,
    },
    {
      resource: schemas.Review,
    },
  ],
  branding: {
    companyName: 'Super Admin Panel | Twoje OSK',
    // logo: LOGO,
    withMadeWithLove: false,
    // favicon: FAVICON,
  },
  rootPath: "/xyz-admin",
  messages: {
    welcome: "", // Set an empty string to remove the welcome message
  },
  rootPath: "/admin", // Specify the root path for the Admin Dashboard
  // Define a custom access function to control access to the dashboard
  access: {
    handler: async (req, res, context) => {
      if (req.isAuthenticated) {
        return true;
      }
      return false;
    },
    redirectTo: "/login",
  },

  cookiePassword: "your-secret-key",
};

const authenticate = async (email, password) => {
  try {
    if (!email || !password) {
      return null;
    }
    const user = await User.findOne({ email: email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return null;
    }
    if (user.role != "superAdmin") {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
};

const admin = new AdminJS(adminJsOptions);
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate,
  cookieName: "adminjs",
  cookiePassword: "sessionsecret",
});

global.__basedir = path.resolve();
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Documentation",
      version: "1.0.0",
      description: "API documentation for your application",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const swaggerSpecification = swaggerJsDoc(swaggerOptions, { explorer: true });
const app = express();
// app.enable('trust proxy');
app.use(cookieParser());
app.use(cors());
// app.use(helmet.hidePoweredBy());
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
// app.use(hpp());
// app.use(xXssProtection());
app.disable("x-powered-by");
// app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.use(useragent.express());

if (process.env.NODE_ENV === "development") {
  const loggerModule = await import("./logger.js"); // Update the file extension if needed
  const logger = loggerModule.default;
  app.use(morgan("tiny", { stream: logger.stream }));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
app.use(xss());
app.use(compression());
app.use(admin.options.rootPath, adminRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecification));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(limiter);
app.use("/api", apiRoutes);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

const port = process.env.PORT || 5000;
app.listen(port, async () => {
  await dbo.connectToServer();
  console.log(`Server is running on port: ${port}`);
});
