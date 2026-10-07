require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const productsRouter = require("./routes/products");
const transactionsRouter = require("./routes/transactions");
const adminRouter = require("./routes/admin");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",");

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-machine tools with no Origin header (curl, server-to-server).
      if (!origin) return callback(null, true);
      // In production, only the configured origin(s) are allowed.
      if (process.env.NODE_ENV === "production") {
        return callback(null, allowedOrigins.includes(origin));
      }
      // In development, also allow localhost/127.0.0.1 on any port and the
      // Devin browser-preview proxy, so local tunnels/previews can reach the API.
      const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(null, allowedOrigins.includes(origin) || isLocal);
    },
  })
);
app.use(express.json());

// Basic protection against rapid-fire duplicate payment submissions / abuse.
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/products", productsRouter);
app.use("/api/transactions", transactionLimiter, transactionsRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`POS backend listening on http://localhost:${PORT}`);
});
