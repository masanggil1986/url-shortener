import express from "express";
import { findByCode, shorten } from "../services/url.service";

const router = express.Router();

router.post("/shorten", async (req, res) => {
  const { url } = req.body;

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  try {
    const code = await shorten(url);
    res.json({
      code,
      url: `${baseUrl}/${code}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});

router.get("/:code", async (req, res) => {
  const { code } = req.params;

  const originalUrl = await findByCode(code);
  res.redirect(301, originalUrl);
});

export default router;
