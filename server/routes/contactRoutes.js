const express = require("express");
const mongoose = require("mongoose");
const TrustedContact = require("../models/TrustedContact");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// ADD TRUSTED CONTACT
// POST /api/contacts
// ======================================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      phone,
      relationship = "Trusted Contact",
      priority = 1,
      isPrimary = false,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact name is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // If this contact is primary, remove primary status
    // from all other contacts belonging to this user.
    if (isPrimary) {
      await TrustedContact.updateMany(
        { user: req.user.id },
        { $set: { isPrimary: false } }
      );
    }

    const contact = await TrustedContact.create({
      user: req.user.id,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      priority,
      isPrimary,
    });

    return res.status(201).json({
      success: true,
      message: "Trusted contact added successfully",
      contact,
    });
  } catch (error) {
    console.error("Add trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL TRUSTED CONTACTS
// GET /api/contacts
// ======================================================

router.get("/", protect, async (req, res) => {
  try {
    const contacts = await TrustedContact.find({
      user: req.user.id,
    }).sort({
      isPrimary: -1,
      priority: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Get trusted contacts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trusted contacts",
      error: error.message,
    });
  }
});

// ======================================================
// GET SINGLE TRUSTED CONTACT
// GET /api/contacts/:id
// ======================================================

router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE TRUSTED CONTACT
// PUT /api/contacts/:id
// ======================================================

router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    const {
      name,
      phone,
      relationship,
      priority,
      isPrimary,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Contact name cannot be empty",
        });
      }

      contact.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty",
        });
      }

      contact.phone = phone.trim();
    }

    if (relationship !== undefined) {
      contact.relationship = relationship;
    }

    if (priority !== undefined) {
      contact.priority = priority;
    }

    if (isPrimary !== undefined) {
      if (isPrimary === true) {
        await TrustedContact.updateMany(
          {
            user: req.user.id,
            _id: { $ne: contact._id },
          },
          {
            $set: {
              isPrimary: false,
            },
          }
        );
      }

      contact.isPrimary = isPrimary;
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Trusted contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// MAKE CONTACT PRIMARY
// PATCH /api/contacts/:id/primary
// ======================================================

router.patch("/:id/primary", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    // Remove primary from all contacts
    await TrustedContact.updateMany(
      { user: req.user.id },
      { $set: { isPrimary: false } }
    );

    // Make selected contact primary
    contact.isPrimary = true;
    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Primary trusted contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Set primary contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update primary trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// DELETE TRUSTED CONTACT
// DELETE /api/contacts/:id
// ======================================================

router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trusted contact deleted successfully",
      deletedContact: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
      },
    });
  } catch (error) {
    console.error("Delete trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete trusted contact",
      error: error.message,
    });
  }
});

module.exports = router;