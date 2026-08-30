const express = require("express");

const {
  startEscalation,
  escalateNext,
  acknowledgeSOS,
  getEscalation,
} = require("../controllers/sosEscalationController");

const router = express.Router();

router.post(
  "/start",
  startEscalation
);

router.put(
  "/:id/escalate",
  escalateNext
);

router.put(
  "/:id/acknowledge",
  acknowledgeSOS
);

router.get(
  "/:id",
  getEscalation
);

module.exports = router;